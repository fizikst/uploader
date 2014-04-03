"use strict";
/*global mock_req_proto,mock_res_proto,should,describe,before,after,it,expect,_ */
describe("edge cases on mongoose", function () {
    before(function (done) {
        _.each(require.cache, function (mod, modName) {
            if (~modName.indexOf('formage') || ~modName.indexOf('mongoose') || ~modName.indexOf('jugglingdb'))
                delete require.cache[modName];
        });
        this.formage = require('../');
        var mongoose = this.mongoose = require("mongoose");
        this.express = require('express');
        var conn_str = 'mongodb://localhost/formage-test' + this.test.parent.title.replace(/\s/g, '');
        mongoose.connect(conn_str, function (err) {
            if (err) return done(err);
            return mongoose.connection.db.dropDatabase(done);
        });
    });

    after(function () {
        delete this.formage;
        this.mongoose.disconnect();
        delete this.mongoose;
        delete this.express;
    });


    describe("no init options, no models", function () {
        before(function () {
            this.app = this.express();
            this.app.use(this.express.cookieParser('magical secret admin'));
            this.app.use(this.express.cookieSession({cookie: { maxAge: 1000 * 60 * 60 * 24 }}));
            this.registry = this.formage.init(this.app, this.express);
        });


        after(function () {
            delete this.app;
            delete this.registry;
        });


        it("works", function () {
            expect(this.registry).to.be.an('object');
        });


        it("show login screen", function (done) {
            var mock_req = _.defaults({
                url: "/login",
                method: "GET"
            }, mock_req_proto);

            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.render = function (view, options) {
                view.should.equal("login.jade");
                should.exist(options);
                this.req.app.render(view, options, function (err, doc) {
                    should.exist(doc);
                    done(err);
                });
            };

            this.app.admin_app.handle(mock_req, mock_res);
        });


        it("can log in", function (done) {
            var mock_req = _.defaults({
                url: "/login",
                method: "POST",
                session: {},
                body: {
                    username: "admin",
                    password: "admin"
                }
            }, mock_req_proto);

            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.redirect = function (path) {
                should.not.exist(mock_res._status);
                "admin".should.equal(mock_req.session._mongooseAdminUser.username);
                module._mongooseAdminUser = mock_req.session._mongooseAdminUser;
                path.should.equal(mock_req.app.route);
                done();
            }.bind(this);

            this.app.admin_app.handle(mock_req, mock_res);
        });


        it("can't log in with wrong creds", function (done) {
            var mock_req = _.defaults({
                url: "/login",
                method: "POST",
                session: {},
                body: {
                    username: "admin",
                    password: "xxx"
                }
            }, mock_req_proto);

            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.redirect = function (path) {
                should.not.exist(mock_res._status);
                path.should.equal("/admin/login?error=true");
                done();
            }.bind(this);

            this.app.admin_app.handle(mock_req, mock_res);
        });


        it("can reenter after login", function (done) {
            if (!module._mongooseAdminUser) done("didn't get present");
            var mock_req = _.defaults({
                url: "/",
                session: {},
                method: "get"
            }, mock_req_proto);
            delete mock_req.admin_user;
            mock_req.session._mongooseAdminUser = module._mongooseAdminUser;
            delete module._mongooseAdminUser;

            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.render = function (view, options) {
                view.should.equal("models.jade");
                should.exist(options);
                this.req.app.render(view, options, function (err, doc) {
                    should.exist(doc);
                    done(err);
                });
            };

            this.app.admin_app.handle(mock_req, mock_res);
        });


        it("can't reenter with no session", function (done) {
            var mock_req = _.defaults({
                url: "/",
                session: {},
                method: "get"
            }, mock_req_proto);
            delete mock_req.admin_user;
            delete mock_req.session._mongooseAdminUser;

            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.redirect = function (path) {
                should.not.exist(mock_res._status);
                expect(mock_req.session['_loginReferrer']).to.equal("/");
                path.should.equal(mock_req.app.route + '/login');
                done();
            }.bind(this);

            this.app.admin_app.handle(mock_req, mock_res);
        });


        it("logout works", function (done) {
            var mock_req = _.defaults({
                url: "/logout",
                headers: {},
                session: {_mongooseAdminUser: {}},
                method: "get"
            }, mock_req_proto);

            var mock_res = _.defaults({ req: mock_req }, mock_res_proto);

            mock_res.redirect = function (path) {
                should.not.exist(mock_res._status);
                should.not.exist(mock_req.session['_loginReferrer']);
                path.should.equal("/");
                done();
            }.bind(this);

            this.app.admin_app.handle(mock_req, mock_res);
        });


        it("ensureExists", function (done) {
            this.registry.adapter.Users.ensureExists("admin", "admin", done);
        });
    });
});
