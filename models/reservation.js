/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  // Getters and setters 

  get numGuests(){
    return this._numGuests;
  }
  
  set numGuests(numGuests){
    if(numGuests > 0){
      this._numGuests = numGuests;
    }else{
      console.log("get rekt");
      throw new Error("Number of guests must be greater than zero");
    }
  }
  
  get notes(){
    return this._notes;
  }

  set notes(note){
    if(note){
      this._notes = note;
    } else{
      this._notes = "";
      // console.log("nice try, no falsys");
    }
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** Save this reservation */
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `, [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else{
      db.query(
        `
        UPDATE reservations SET customer_id=$1, start_at=$2, num_guests=$3, notes=$4
        WHERE id=$5
        `, [this.customerId, this.startAt, this.numGuests, this.notes]
      )
    }
  }
}

module.exports = Reservation;
