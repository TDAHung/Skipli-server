class BadRequestException extends Error {
    constructor(message) {
        super(message);
        this.name = "BadRequestException";
        this.statusCode = 400;
    }
}

class InternalServerException extends Error {
    constructor(message) {
        super(message);
        this.name = "InternalServerException";
        this.statusCode = 500;
    }
}

class NotFoundException extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundException";
        this.statusCode = 404;
    }
}

module.exports = { BadRequestException, InternalServerException, NotFoundException };
