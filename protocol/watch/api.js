var passwordParameter = {
    type: "text",
    pattern: "^[0-9]{4}$"
};

module.exports = {
    locateOneTime: {
        parameters: {
            password: passwordParameter
        }
    }
};
