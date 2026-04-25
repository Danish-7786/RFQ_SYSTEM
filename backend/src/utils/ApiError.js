class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    )
    // Overriding the constructor
    {
        super(message)
        this.statusCode = statusCode
        // data fields are usually done null
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors
      //if error occurs then developer will get to know that yaha yaha dikkat hai 
      //matlb error kis line me occur kar raha ye batata hai
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}