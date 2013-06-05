var timePeriodParameter = {
    type: "text",
    pattern: "^[0-9]{1,3}[s|S|m|M|h|H]$"
};

module.exports =  {
    setOnLineMode : {
        parameters: {
            interval: timePeriodParameter
        }
    }
};
