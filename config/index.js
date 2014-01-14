var path = require('path');

var configJSON = require(path.join(__dirname, 'config.json'));

(function() {
    var config, environment;
    environment = process.env.NODE_ENV || 'development';

    config = configJSON;

//    exports.redis = config[environment]['redis'];
    exports.postgres = {
        'user' : config[environment]['user'],
        'password' : config[environment]['password'],
        'host' : config[environment]['host'],
        'port' : config[environment]['port'],
        'database' : config[environment]['database']
    };
    exports.machine = config[environment]['machine'];
    exports.beanstalkd = config[environment]['beanstalkd'];

}).call(this);
