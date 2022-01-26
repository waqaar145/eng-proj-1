exports.up = function (knex, Promise) {
  return knex
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .then(function () {
      return knex.schema.createTable("users", function (table) {
        table.increments("u_id").unsigned().primary();
        table.uuid("u_uuid").unique().defaultTo(knex.raw("uuid_generate_v4()"));
        table.string("u_first_name").notNullable();
        table.string("u_last_name").notNullable();
        table.string("u_username").unique().notNullable();
        table.string("u_email").unique().notNullable();
        table.bigint("u_mobile").unique().notNullable();
        table.string("u_password").notNullable();
        table.string("u_dp", 1000).defaultTo(null);
        table.string("u_designation", 50).defaultTo(null);
        table.string("u_social_source", 1000).defaultTo(0);
        table.boolean("u_is_active").defaultTo(true);
        table.boolean("u_is_deleted").defaultTo(false);
        table.timestamp("u_created_at").defaultTo(knex.fn.now());
        table.timestamp("u_updated_at").defaultTo(knex.fn.now());
      });
    })
    .then(function () {
      return knex.schema.createTable("groups", function (table) {
        table.increments("g_id").unsigned().primary();
        table.uuid("g_uuid").unique().defaultTo(knex.raw("uuid_generate_v4()"));
        table.string("g_group_name").default("");
        table.boolean("g_group_type"); // Private -> True, Group -> False, Public -> NULL
        table.integer("g_members").default(0);
        table.integer("g_created_by").references('u_id').inTable('users');
        table.boolean("g_is_active").defaultTo(true);
        table.timestamp("g_created_at").defaultTo(knex.fn.now());
        table.timestamp("g_updated_at").defaultTo(knex.fn.now());
      });
    })
    .then(function () {
      return knex.schema.createTable("participants", function (table) {
        table.increments("p_id").unsigned().primary();
        table.integer("p_user_id").references('u_id').inTable('users');
        table.integer("p_group_id").references('g_id').inTable('groups');
        table.boolean("p_is_active").defaultTo(true);
        table.timestamp("p_created_at").defaultTo(knex.fn.now());
        table.timestamp("p_updated_at").defaultTo(knex.fn.now());
      });
    }).then(function () {
      return knex.schema.createTable("messages", function (table) {
        table.increments("m_id").unsigned().primary();
        table.integer("m_user_id").references('u_id').inTable('users');
        table.integer("m_group_id").references('g_id').inTable('groups');
        table.integer('m_parent_id').default(null);
        table.string("m_message", 5000).notNullable();
        // table.integer('m_total_likes').defaultTo(0);
        // table.integer('m_total_dislikes').defaultTo(0);
        table.jsonb('m_reactions');
        table.jsonb('m_profile_replies');
        table.integer('m_total_replies').defaultTo(0);
        table.boolean('m_read').defaultTo(false);
        table.boolean("m_is_active").defaultTo(true);
        table.timestamp("m_created_at").defaultTo(knex.fn.now());
        table.timestamp("m_updated_at").defaultTo(knex.fn.now());
      });
    })
    .then(function () {
      return knex.schema.createTable("messages_files", function (table) {
        table.increments("mf_id").unsigned().primary();
        table.integer("mf_message_id").references('m_id').inTable('messages');
        table.string("mf_file_url", 1000).notNullable();
        table.string("mf_file_type").notNullable();
        table.boolean("mf_is_active").defaultTo(true);
        table.timestamp("mf_created_at").defaultTo(knex.fn.now());
        table.timestamp("mf_updated_at").defaultTo(knex.fn.now());
      });
    })
    .then(function () {
      return knex.schema.createTable('messages_likes', function(table) {
        table.increments('ml_id').unsigned().primary();
        table.integer('ml_user_id').references('u_id').inTable('users');
        table.integer('ml_message_id').references('m_id').inTable('messages');
        table.integer('ml_value').notNullable();
      });
    });
};

exports.down = function (knex, Promise) {
  return knex
            .schema
            .dropTable("messages_likes")
            .dropTable("messages_files")
            .dropTable("messages")
            .dropTable("participants")
            .dropTable("groups")
            .dropTable("users");     
};