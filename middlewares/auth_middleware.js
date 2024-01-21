const ApiError = require('../error/ApiError');
const tokenService = require('../services/token_service');

module.exports = function(allowedRoles) {
    return function(req, res, next) {
        try {
            const authorizationHeader = req.headers.authorization;
            if (!authorizationHeader) {
                return next(ApiError.UnauthorizedError());
            }

            const accessToken = authorizationHeader.split(' ')[1];
            if (!accessToken) {
                return next(ApiError.UnauthorizedError());
            }

            const userData = tokenService.validateAccessToken(accessToken);
            if (!userData) {
                return next(ApiError.UnauthorizedError());
            }

            // Check if user's role is in the allowedRoles
            if (!allowedRoles.includes(userData.role)) {
                return next(ApiError.ForbiddenError('Insufficient permissions'));
            }

            req.user = userData;
            next();
        } catch (e) {
            return next(ApiError.UnauthorizedError());
        }
    };
};