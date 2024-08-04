const { Types } = require("mongoose");

exports.searchPropertiesQuery = (userId, q = "") => {
  return [
    {
      $match: {
        $and: [
          { user_id: { $ne: Types.ObjectId(userId) } },
          {
            $or: [
              { title: { $regex: q, $options: "i" } },
              { location: { $regex: q, $options: "i" } },
            ],
          },
        ],
      },
    },
    {
      $lookup: {
        from: "media",
        localField: "media",
        foreignField: "_id",
        as: "media",
      },
    },
    {
      $lookup: {
        from: "users", 
        localField: "user_id",
        foreignField: "_id",
        as: "user_id",
      },
    },
    {
      $unwind: {
        path: "$user_id",
      },
    },
    {
      $lookup: {
        from: "media",
        localField: "user_id.profileImage",
        foreignField: "_id",
        as: "user_id.profileImage",
      },
    },
    {
      $unwind: {
        path: "$user_id.profileImage",
      },
    },
    {
      $lookup: {
        from: "media",
        localField: "user_id.ssn_image",
        foreignField: "_id",
        as: "user_id.ssn_image",
      },
    },
    {
      $unwind: {
        path: "$user_id.ssn_image",
      },
    },
    {
      $lookup: {
        from: "favorites",
        localField: "_id",
        foreignField: "propertyId",
        as: "favourite"
      }
    },
    {
      $addFields:
        /**
         * newField: The new field name.
         * expression: The new field expression.
         */
        {
          isliked: {
            $filter: {
              input: "$favourite",
              as: "elem",
              cond: {
                $eq: [
                  "$$elem.userId",
                  Types.ObjectId(userId)
                ]
              }
            }
          }
        }
    },
    {
      $addFields:
        {
          isLiked: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: "$isliked"
                  },
                  0
                ]
              },
              then: true,
              else: false
            }
          }
        }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        user_id:1,
        media:1,
        description:1,
        Bedrooms:1,
        Bathrooms:1,
        size:1,
        price:1,
        parking:1,
        farnished:1,
        coordinates:1,
        city:1,
        property_type:1,
        user_id:1,
        status:1,
        isLiked:1
      }
    }
  ];
};
