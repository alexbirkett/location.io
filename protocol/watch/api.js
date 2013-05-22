var passwordParameter = {
    type: "text",
    pattern: "^[0-9]{4}$"
};

var capabilities = {
    message: {},
    commands: {
        locateOneTime: {
            parameters: {
                password: passwordParameter
            }
        }
    }
};

module.exports = capabilities;
