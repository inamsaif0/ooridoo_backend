exports.STATUS_CODE = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    CONTENT_NOT_AVAILABLE: 410,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
});

exports.COMPETITION_STATUS = Object.freeze({
    UPCOMING: 'Upcoming',
    STARTED: 'Started',
    COMPLETED: 'Completed',
});

exports.COMPETITION_STYLE = Object.freeze({
    COMPETITIVE_PLAY: 'Competitive Play',
    JACKPOT_PLAY: 'Jackpot Play',
});

exports.COMPLETION_TYPE = Object.freeze({
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
});

exports.NOTIFICATION_TYPE = Object.freeze({

    REQUEST_SENT: 'request-sent',
    REQUEST_ACCEPTED: 'request-accepted',
    REQUEST_REJECTED: 'request-rejected',
    RENT_DUE: 'rent-due',
    RENT_OVERDUE: 'rent-overdue',
    MESSAGE_SENT: 'message-sent',
    RATING_ADDED: 'rating-added',
    RATING_REPLAY: 'rating-reply'
    // MESSAGE_FLAG: 'message-flag'
});


exports.NOTIFICATION_RELATED_TYPE = Object.freeze({
    MESSAGE: 'message',
    POST: 'post',
    COMPETITION: 'competition',
    FOLLOWER:'follower',
    UN_FOLLOW: 'un-follow',
    PROPERTY: 'property'
});

exports.PAYMENT_STATUS = Object.freeze({
    CREDIT: 'credit',
    DEBIT: 'debit'
});

exports.STATUS = Object.freeze({
    STARTED: "started",
    NOT_STARTED: "not-started"
})
exports.REQUEST_TYPE = Object.freeze({
    PROPERTY: 'property',
    FOLLOW: 'follow'
});
exports.REVIEW_STATUS = Object.freeze({
    OWNER: 'owner',
    TENANT: 'tenant'
});
exports.FAVORTIRE_TYPE = Object.freeze({
    PROPERTY: 'property',
});

exports.RENT_STATUS = Object.freeze({
    PAID: 'paid',
    UNPAID: 'unpaid'
});

exports.TIME_STATUS = Object.freeze({
    OVERDUE: 'overdue',
    DUE: 'due'
});
exports.REQUEST_STATUS = Object.freeze({
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    CANCELED: 'canceled'
});
exports.PROPERTY_STATUS = Object.freeze({
    AVAILABLE: 'available',
    OCCUPIED: 'occupied'
});
exports.VOTE_TYPES = Object.freeze({
    UP: 'up',
    DOWN: 'down'
});

exports.ROLES = Object.freeze({
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
})