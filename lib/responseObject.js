function createResponse(statusCode, message, token, data) {

    let responseObject = {
        status: {
            responseCode: statusCode,
            message: message
        },
        token: token,
        data: data
    };

    return responseObject;
};

module.exports = createResponse;