exports.throwErrorMessage = (error) => {
    let errors = { email: '', password: '' };

    if(error.message == 'Mailing address not found!') {
        errors.email = error.message
        return errors
    }

    if(error.message == 'User password is incorrect!') {
        errors.password = error.message
        return errors
    }

    if(error.code === 11000) {
        errors.email = 'Mailing address already exists!'
        return errors
    }

    if(error.message.includes('User validation failed')) {
        Object.values(error.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message
        })    
    }

    return errors
}