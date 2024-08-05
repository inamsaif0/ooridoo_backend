'use strict';

const router = require('express').Router();
const {handleMultipartData}=require("../utils/multipart")
// const {handleMultipartData} =  require("../utils/index")

const {
    fetchUsersExceptBlocked,
    getUser,
    updateUser,
    uploadImage,
    resetPassword,
    logout,
    blockToggle,
    fetchUsersExceptCurrentAndAdmin,
    activeInactiveToggle,
    createTransfer,
    addCardToStripe,
    createAccount,
    getCard,
    loginToConnectAccount,
    getAllCard,
    addCardToStripeCustomer,
    connectAccountSuccessful,
    deleteCard,
    chargeFromUser,
    updateProfile,
    getUserDetails,
    getProfile,
    getProfileById,
    uploadBackgroudImage,
    NotificationOn,
    getAllUsers
} = require('../controller/user');
const { upload } = require('../utils');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const { fetchProperties } = require('../controller/property')
class UserAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;


        // router.get('/:userId', authMiddleware(Object.values(ROLES)), getUser);

        // router.post('/get-user-by-id', authMiddleware(Object.values(ROLES)),  upload().none(),getUserDetails)
        // // get all users except current user and admin 
        // router.post('/all', authMiddleware([ROLES.USER]), upload().none(), fetchUsersExceptBlocked);
        router.get('/get-profile', authMiddleware([ROLES.OWNER]), getProfile)
        // // get all users (Admin API)
        router.get('/get-profile/:id', authMiddleware(Object.values(ROLES)), getProfileById)
        router.post('/search-user', authMiddleware([ROLES.ADMIN]), upload().none(), fetchProperties);
        router.get('/get-all-users', authMiddleware([ROLES.ADMIN]), getAllUsers)
        // router.post('/update', authMiddleware(Object.values(ROLES)), upload().none(), updateUser);
        router.post('/upload-image', authMiddleware(Object.values(ROLES)), handleMultipartData.single('image'), uploadBackgroudImage);

        router.post('/update-notification-status', authMiddleware(Object.values(ROLES)), NotificationOn)

        router.post('/reset-password', authMiddleware(Object.values(ROLES)), upload().none(), resetPassword);
        router.post('/logout', authMiddleware(Object.values(ROLES)), logout); 

        // router.post('/block-toggle', upload().none(), authMiddleware([ROLES.USER]), blockToggle);

        // // this is to delete the connect account
        // router.post('/create-connect-account', upload().none(), authMiddleware([ROLES.USER]), createAccount);
        // router.post('/login-connect-account', upload().none(), authMiddleware([ROLES.USER]), loginToConnectAccount);


        // //send amount to winner from admin panel after the winner announcement
        // router.post('/transaction-winner-amount', upload().none(), authMiddleware([ROLES.ADMIN]), createTransfer);

        // // ADD CARD TO STRIPE ACCOUNT
        // router.post('/add-card-to-stripe', upload().none(), authMiddleware([ROLES.USER]), addCardToStripe);

        // //add customer card
        // router.post('/add-card-to-stripe-customer', upload().none(), authMiddleware([ROLES.USER]), addCardToStripeCustomer);

        // router.post('/connect_account_successful',upload().none(), authMiddleware(ROLES.USER), connectAccountSuccessful)
        // router.post('/delete_card',upload().none(), authMiddleware(ROLES.USER), deleteCard)
        // router.post('/register',handleMultipartData.single("image"), register);
        router.post('/complete-profile' , authMiddleware(Object.values(ROLES)), handleMultipartData.fields([

            {
              name: "profile_image",
              maxCount: 1,
            }
          ]), updateProfile );

        //get card of the stripe owner
        // router.post('/get-card-by-id', upload().none(), authMiddleware([ROLES.USER]), getCard);

        // //get all the cards of the customers
        // router.post('/get-all-cards', authMiddleware([ROLES.USER]), getAllCard);

        // router.post('/charge', authMiddleware([ROLES.USER]), chargeFromUser);

        
        // // dashboard APIs
        router.put('/status', authMiddleware([ROLES.ADMIN]), activeInactiveToggle);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/user';
    }
}

module.exports = UserAPI;