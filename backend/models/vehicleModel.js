import mongoose, { mongo } from "mongoose";

const vehicleSchema = new mongoose.Schema({
  registeration_number: {
    type: String,
    required: true,
    unique: true,
    index: true, // Add index for faster queries
  },
  car_title:{
    type:String,
    required:false
  },
  car_description:{
    type:String,
    required:false
  },
  created_at:{
    type:String,
    required:false
  },
  updated_at:{
    type:String,
    required:false
  },
  remark:{
    type:String,
    required:false
  },
  company: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  model: {
    type: String,
    required: false,
  },
  year_made: {
    type: Number,
    required: false,
  },
  fuel_type: {
    type: String,
    enum:["petrol", "diesel", "electirc","hybrid"],
    required:false
  },
  rented_by: {
    type: String,
    required: false,
  },
  rating: {
    type: ["1", "2", "3", "4", "5"],
    requrired:false,
  },
  seats: {
    type: Number,
    required: false,
  },
  transmition: {
    type: String,
    enum:["manual","automatic"]
  },
  image: {
    type:Array,
    required:false
  },
  description: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  base_package: {
    type: String,
    required: false,
  },
  with_or_without_fuel: {
    type: Boolean,
    required: false,
  },
  insurance_end: {
    type: Date,
    required: false,
    default: null,
  },
  registeration_end: {
    type: Date,
    required: false,
    default: null,
  },
  pollution_end: {
    type: Date,
    required: false,
    default: null,
  },
  certificates: {
    fitness: {
      type: String,
      required: false,
    },
    registration: {
      type: String,
      required: false,
    },
    rc: {
      type: String,
      required: false,
    },
    pollution: {
      type: String,
      required: false,
    },
  },
  car_type: {
    type: String,
  },
  isDeleted:{
    type:String,
    default:"false",
    required:false,
    index: true, // Add index for faster filtering
  },
  location:{
    type:String,
    required:false,
    default: "Hitech City"
  },
  district:{
    type:String,
    required:false,
    default: "Hyderabad"
  },
  state:{
    type:String,
    required:false,
    default: "Telangana"
  },
  city:{
    type:String,
    required:false,
    default: "Hyderabad"
  },
  isBooked:{
    type:Boolean,
    default:false
  },
  isAdminAdded:{
    type:Boolean,
    default:true
  },
  addedBy:{
    type:String,
    default:'admin'
  },
  isAdminApproved:{
    type:Boolean,
    default:true,
    index: true, // Add index for faster filtering
  },
  isRejected:{
    type:Boolean,
    default:false
  }

});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
