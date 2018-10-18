module.exports = {
    // Searches an array of objects compares its name property
    searchArrayForName: function (array, name) {
        for (let i = 0; i < array.length; i++)
        {
            if (array[i].name === name)
            {
                return array[i];
            }
        }
    },

    searchMapForName: function (map, name) {
        for (var value of map.values())
        {
            if (value.name === name)
            {
                return value;
            }
        }
    }
};