/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, numReserv, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.numReserv = numReserv;
    this.phone = phone;
    this.notes = notes;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /** find all customers. */

  static async all(fullName=" ") {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    const customers = results.rows.map(c => new Customer(c));
    const regex = new RegExp(`.*${fullName}.*`, 'i');
    const filtered = customers.filter(c => regex.test(c.fullName));
    return filtered;
  }

  /** Top 10 ranking: sort customers by number of reservations*/
  static async rank(){
    const results = await db.query(
      ` 
      SELECT c.id, c.first_name AS "firstName", c.last_name AS "lastName", c.phone, c.notes, COUNT(r.id) AS "numReserv" 
      FROM customers c 
      JOIN reservations r ON c.id = r.customer_id 
      GROUP BY c.last_name, c.first_name, c.id
      ORDER BY COUNT(r.id)
      DESC
      LIMIT 10
      `
    );
    const customers = results.rows.map(c => new Customer(c));
    return customers;
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }
  
  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
