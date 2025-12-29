import Vehicle from "../../models/vehicleModel.js";
import { errorHandler } from "../../utils/error.js";

export const adminAuth = async (req,res,next)=> {
    try{
        if(req.user.isAdmin){
            res.status(200).json({message:"admin loged in successfully"})
        }
        else{
            res.status(403).json({message:"only acces for admins"})
        }
        
    }
    catch(error){
        next(error)
    }
}

export const adminProfiile = async (req,res,next)=> {
    try{

    }
    catch(error){
        next(error)
    }
}

// Add new vehicle by admin
export const addVehicle = async (req, res, next) => {
    try {
        const vehicleData = req.body;
        
        // Check if vehicle with same registration number exists
        const existingVehicle = await Vehicle.findOne({ 
            registeration_number: vehicleData.registeration_number 
        });
        
        if (existingVehicle) {
            return next(errorHandler(400, "Vehicle with this registration number already exists"));
        }
        
        // Set admin-specific fields
        vehicleData.isAdminAdded = true;
        vehicleData.addedBy = 'admin';
        vehicleData.isAdminApproved = true;
        vehicleData.isRejected = false;
        vehicleData.isDeleted = 'false';
        vehicleData.isBooked = false;
        
        const newVehicle = new Vehicle(vehicleData);
        const savedVehicle = await newVehicle.save();
        
        res.status(201).json({
            success: true,
            message: "Vehicle added successfully",
            vehicle: savedVehicle
        });
        
    } catch (error) {
        console.log(error);
        next(errorHandler(500, "Error adding vehicle"));
    }
};

// Update vehicle by admin
export const updateVehicle = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        const updateData = req.body;
        
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { ...updateData, updated_at: new Date().toISOString() },
            { new: true }
        );
        
        if (!updatedVehicle) {
            return next(errorHandler(404, "Vehicle not found"));
        }
        
        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            vehicle: updatedVehicle
        });
        
    } catch (error) {
        console.log(error);
        next(errorHandler(500, "Error updating vehicle"));
    }
};

// Delete vehicle by admin
export const deleteVehicle = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        
        const vehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { isDeleted: 'true' },
            { new: true }
        );
        
        if (!vehicle) {
            return next(errorHandler(404, "Vehicle not found"));
        }
        
        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });
        
    } catch (error) {
        console.log(error);
        next(errorHandler(500, "Error deleting vehicle"));
    }
};

// Get all vehicles for admin
export const getAllVehicles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status = 'all' } = req.query;
        
        let filter = {};
        
        if (status === 'active') {
            filter.isDeleted = 'false';
        } else if (status === 'deleted') {
            filter.isDeleted = 'true';
        } else if (status === 'booked') {
            filter.isBooked = true;
        } else if (status === 'available') {
            filter.isBooked = false;
            filter.isDeleted = 'false';
        }
        
        const vehicles = await Vehicle.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });
            
        const total = await Vehicle.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            vehicles,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        console.log(error);
        next(errorHandler(500, "Error fetching vehicles"));
    }
};

// Get vehicle by ID
export const getVehicleById = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;
        
        const vehicle = await Vehicle.findById(vehicleId);
        
        if (!vehicle) {
            return next(errorHandler(404, "Vehicle not found"));
        }
        
        res.status(200).json({
            success: true,
            vehicle
        });
        
    } catch (error) {
        console.log(error);
        next(errorHandler(500, "Error fetching vehicle"));
    }
};

