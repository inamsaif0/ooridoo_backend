const {
  createRequest,
  findRequestById,
  getRequest,
  findRequest,
  insertManyRequest,
  updateRequest,
  getRequests,
  updateMyProperties,
  allrequest,
} = require("../models/request");
const {
  findPropertybyId,
  updateProperty,
  getPropertyForOwner,
  PropertyModel,
} = require("../models/property");
const { generateResponse, parseBody } = require("../utils");
const {
  REQUEST_STATUS,
  PROPERTY_STATUS,
  STATUS_CODE,
  REQUEST_TYPE,
  STATUS,
  NOTIFICATION_TYPE,
} = require("../utils/constants");
const { findUser } = require("../models/user");
const { sendRequest } = require("../socket");
const { createRent, findRents, allrent } = require("../models/rent");
const moment = require('moment')

const { createAndSendNotification } = require("../models/notification")
exports.sendRequest = async (req, res, next) => {
  try {
    const { receiverId, propertyId, inComingDate, outGoingDate } = parseBody(
      req.body
    );

    const userExists = await findUser({ _id: req.user.id });
    let Request = await findRequest({
      senderId: req.user.id,
      receiverId: receiverId,
      propertyId: propertyId,
      status: REQUEST_STATUS.PENDING,
    });
    let property = await findRequest({
      propertyId: propertyId,
      receiverId: receiverId,
      status: REQUEST_STATUS.ACCEPTED,
    });
    console.log("this is list>>>>>>>>>>>>>>>>>>>>>>", property);
    if (property) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "property occupied by another user",
      });
    }
    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    if (Request) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request Already Send",
      });
    }

    let Property = await findPropertybyId(propertyId);

    if (!Property) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }

    // if (Property && Property.status == PROPERTY_STATUS.OCCUPIED) {
    //   return next({
    //     statusCode: STATUS_CODE.BAD_REQUEST,
    //     message: "Property is occupied ",
    //   });
    // }

    let data = await createRequest({
      senderId: req.user.id,
      propertyId: propertyId,
      receiverId: receiverId,
      status: REQUEST_STATUS.PENDING,
      incomingDate: inComingDate, // ISO 8601 format 2024-05-01T00:00:00Z
      outgoingDate: outGoingDate, // ISO 8601 format 2024-05-15T00:00:00Z
    });

    const senderObject = await findUser({ _id: req.user.id });
    const receiverIds = [receiverId];
    const type = NOTIFICATION_TYPE.REQUEST_SENT;
    await createAndSendNotification({ senderObject, receiverIds, type, property: Property, relatedId:propertyId, relatedType:"property" });

    let receiverRequests = await getRequests({
      id: receiverId,
      status: REQUEST_STATUS.PENDING,
    });
    if (receiverRequests) {
      sendRequest(receiverId, receiverRequests);
      
    }
    generateResponse(data, "Property Request is succesfully Created", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.acceptRejectRequest = async (req, res, next) => {
  const { requestId, status, isminute } = parseBody(req.body);
  try {
    let request = await findRequestById(requestId);
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }

    if (!request) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request not found",
      });
    }

    // if (request && request.status == REQUEST_STATUS.ACCEPTED) {
    //   return next({
    //     statusCode: STATUS_CODE.BAD_REQUEST,
    //     message: "Request already accepted",
    //   });
    // }

    if (request && request.status == REQUEST_STATUS.REJECTED) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request is rejected",
      });
    }

    let property= await updateProperty(request.propertyId, {
      status: PROPERTY_STATUS.OCCUPIED,
    });

    if (status == REQUEST_STATUS.REJECTED) {
      let data = await updateRequest(request._id, {
        status: status,
      });
      const senderObject = await findUser({ _id: request.receiverId });
      const receiverIds = [request.senderId];
      const type = NOTIFICATION_TYPE.REQUEST_REJECTED;

      await createAndSendNotification({ senderObject, receiverIds, type, property, relatedId:data?._id, relatedType:"property" });
      generateResponse([], "Property Request is Rejected", res);
    }

    // if (data) {
    //   let receiverRequests = await getRequests({
    //     id: request.receiverId,
    //     status: REQUEST_STATUS.PENDING,
    //   });
    //   sendRequest(request.receiverId, receiverRequests);
    // }

    if (status == REQUEST_STATUS.ACCEPTED) {
      let ids = await allrequest({});

      let data = await updateRequest(request._id, {
        status: status,
      });
      console.log('this is data>>>>>>>>>>>',data);
      let value = data.propertyId.toString();
      let resData = await findPropertybyId(value);

      console.log(resData);

      for (const id of ids) {
        console.log(id._id, request._id);
        if (id._id.toString() !== request._id.toString()) {
          await updateRequest(id._id, { status: "rejected" });
        }
      }
      if (data && isminute ==  false) {
        let currentStartDate = moment(data.incomingDate);
        const finalEndDate = moment(data.outgoingDate);

        const rentPromises = [];
        let isFirstMonth = true;

        while (currentStartDate.isBefore(finalEndDate)) {
          const currentEndDate = moment(currentStartDate).endOf("month");
          const outgoingDate = currentEndDate.isBefore(finalEndDate)
            ? currentEndDate
            : finalEndDate;
            const now = moment();

          console.log("this is data for request>>>>>>>>", property);
          rentPromises.push(
            await createRent({
              propertyId: data.propertyId,
              receiverId: data.receiverId,
              tenantId: data.senderId,
              price: property.price,
              time_status: data.time_status,
              type: REQUEST_TYPE.PROPERTY,
              status: currentStartDate.isSame(now, 'day')  ? STATUS.STARTED : STATUS.NOT_STARTED,
              startingDate: currentStartDate.toDate(),
              endingDate: outgoingDate.toDate(),
              paidOnDate: outgoingDate.toDate()
            })
          );

          // Move to the start of the next month
          currentStartDate = currentStartDate.add(1, "months").startOf("month");
          isFirstMonth = false; // After the first iteration, set this to false
        }

        await Promise.all(rentPromises);
      }

      if (data && isminute) {
        let currentStartDate = moment(data.incomingDate);
        const finalEndDate = moment(data.outgoingDate);
      
        const rentPromises = [];
      
        while (currentStartDate.isBefore(finalEndDate)) {
          const outgoingDate = moment(currentStartDate).add(5, "minutes");
          const now = moment();
      
          console.log("this is data for request>>>>>>>>", property);
          rentPromises.push(
            await createRent({
              propertyId: data.propertyId,
              receiverId: data.receiverId,
              tenantId: data.senderId,
              price: property.price,
              time_status: data.time_status,
              type: REQUEST_TYPE.PROPERTY,
              status: currentStartDate.isSame(now, 'minute') ? STATUS.STARTED : STATUS.NOT_STARTED,
              startingDate: currentStartDate.toDate(),
              endingDate: outgoingDate.isBefore(finalEndDate) ? outgoingDate.toDate() : finalEndDate.toDate(),
              paidOnDate: outgoingDate.toDate()
            })
          );
      
          // Move to the next 5-minute interval
          currentStartDate = currentStartDate.add(5, "minutes");
        }
      
        await Promise.all(rentPromises);
      }
      
      const senderObject = await findUser({ _id: request.receiverId });
      const receiverIds = [request.senderId];
      const type = NOTIFICATION_TYPE.REQUEST_ACCEPTED;
      await createAndSendNotification({ senderObject, receiverIds, type, property: resData,relatedId:data?._id, relatedType:"property" });
      generateResponse(
        resData,
        "Property Request is succesfully Accepted",
        res
      );
    }
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getMyTenant = async (req, res, next) => {
  try {

    console.log('this is user Id', req.user.id)
    let myTenant = await allrent({
      receiverId: req.user.id,
      status: STATUS.STARTED,
    });
    if (myTenant) {
      generateResponse(myTenant, "Tenants Retrived Successfully", res);
    }
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.cancleRequest = async (req, res, next) => {
  const { requestId } = parseBody(req.body);
  try {
    
    let request = await findRequestById(requestId);

    if (!request) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request not found",
      });
    }

    if (request && request.status == REQUEST_STATUS.ACCEPTED) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request already accepted",
      });
    }

    if (request && request.status == REQUEST_STATUS.REJECTED) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Request is rejected",
      });
    }

    let data = await updateRequest(request.id, {
      status: REQUEST_STATUS.CANCELED,
    });
    let resData = await findRequestById(data._id);
    if (data) {
      let receiverRequests = await getRequests({
        id: request.receiverId,
        status: REQUEST_STATUS.PENDING,
      });

      sendRequest(request.receiverId, receiverRequests);
    }
    generateResponse(resData, "Request is succesfully canceled", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    let senderRequests = await getRequest({
      senderId: req.user.id,
      status: REQUEST_STATUS.PENDING,
    });

    if (!senderRequests) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }
    generateResponse(
      senderRequests,
      "Property Request is succesfully Retrieved",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getPropertyRequestss = async (req, res, next) => {
  try {
    const { propertyId } = req.query;
    const userExists = await findUser({ _id: req.user.id });
    console.log(propertyId);
    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    let senderRequests = await getRequest({
      receiverId: req.user.id,
      status: REQUEST_STATUS.PENDING,
      propertyId: propertyId,
    });

    if (!senderRequests) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }
    generateResponse(
      senderRequests,
      "Property Request is succesfully Retrieved",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getPropertyRequests = async (req, res, next) => {
  try {
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }
    let senderRequests = await getRequests({
      id: req.user.id,
      status: REQUEST_STATUS.PENDING,
    });

    if (!senderRequests) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }
    generateResponse(
      senderRequests,
      "Property Request is succesfully Retrieved",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};
