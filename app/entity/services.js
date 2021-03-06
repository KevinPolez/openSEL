﻿var pg = require('pg');
var Q = require('q');

function Services() {
	this.databaseURL = process.env.OPENSHIFT_POSTGRESQL_DB_URL;
	if (typeof this.databaseURL === "undefined") {
		this.databaseURL = "postgresql://postgres:eilrach@127.0.0.1:5432/postgres";
    };
};

/**
 * Create database model
 */
Services.prototype.create = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("CREATE TABLE services( "
						+ "id SERIAL"
						+ ", user_id INTEGER"
						+ ", title CHARACTER VARYING(32)"
						+ ", description TEXT"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", type SERVICES_TYPE DEFAULT 'offer'::SERVICES_TYPE"
						+ ", status SERVICES_STATUS DEFAULT 'disable'::SERVICES_STATUS)", function(err) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	
	return deferred.promise;
}

/**
 * Reset database model
 */
Services.prototype.reset = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		
		client.query("DROP TABLE IF EXISTS services", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});

		client.query("DROP TYPE IF EXISTS SERVICES_TYPE CASCADE", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});
		
		client.query("CREATE TYPE SERVICES_TYPE AS ENUM ('offer', 'request')", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});
		
		client.query("DROP TYPE IF EXISTS SERVICES_STATUS CASCADE", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});
		
		client.query("CREATE TYPE SERVICES_STATUS AS ENUM ('enable', 'disable')", function(err) {
			if ( err ) {done(client); deferred.reject(err);}
		});

		client.query("CREATE TABLE services( "
						+ "id SERIAL"
						+ ", user_id INTEGER"
						+ ", title CHARACTER VARYING(32)"
						+ ", description TEXT"
						+ ", creation_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", update_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"
						+ ", type SERVICES_TYPE DEFAULT 'offer'::SERVICES_TYPE"
						+ ", status SERVICES_STATUS DEFAULT 'disable'::SERVICES_STATUS)", function(err) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	
	return deferred.promise;
}

/**
 * SELECT a service from database
 */
Services.prototype.select = function(service_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", user_id"
					+ ", title"
					+ ", description"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ ", type"
					+ ", status"
					+ " FROM services"
					+ " WHERE id = $1"
					+ " LIMIT 1", [service_id],function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows[0]);
		});
	});
	
	return deferred.promise;
};

/**
 * SELECT a list of services from database
 */
Services.prototype.list = function() {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", user_id"
					+ ", title"
					+ ", description"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ ", type"
					+ ", status"
					+ " FROM services", function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows);
		});
	});
	
	return deferred.promise;
};

/**
 * SELECT a list of services from database depending an user
 */
Services.prototype.listOwn = function(user_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("SELECT id"
					+ ", user_id"
					+ ", title"
					+ ", description"
					+ ", to_char(creation_date, 'YYYY-MM-DD HH24:MI:SS') as creation_date"
					+ ", to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as update_date"
					+ ", type"
					+ ", status"
					+ " FROM services"
					+ " WHERE user_id = $1", [user_id], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve(result.rows);
		});
	});
	
	return deferred.promise;
};

/**
 * INSERT a service on database
 */
Services.prototype.insert = function(user_id, type, title, description) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("INSERT INTO services("
					+ " user_id"
					+ ", type"
					+ ", title"
					+ ", description )"
					+ " VALUES($1,$2,$3,$4) RETURNING id", [user_id, type, title, description], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	return deferred.promise;
};

/**
 * DELETE a service from database
 */
Services.prototype.remove = function(user_id, service_id) {
	var self = this;
	var deferred = Q.defer();
	
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("DELETE FROM services"
					+ " WHERE id = $1 AND user_id = $2", [service_id, user_id], function(err, result) {
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	return deferred.promise;
};

/**
 * UPDATE a service on database
 */
Services.prototype.update = function(user_id, service_id, type, title, description) {
	var self = this;
	var deferred = Q.defer();
		
	pg.connect(self.databaseURL, function(err, client, done) {
		client.query("UPDATE services SET"
					+ " type = $1"
					+ ", title = $2"
					+ ", description = $3"
					+ ", update_date = NOW()"
					+ " WHERE id = $4 AND user_id = $5", [type, title, description, service_id, user_id], function(err, result) {
					
			done(client);
			if ( err ) deferred.reject(err);
			deferred.resolve();
		});
	});
	return deferred.promise;
};

module.exports = Services;