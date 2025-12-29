import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "react-redux";
import { addVehicleClicked } from "../../../redux/adminSlices/actions";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { MenuItem } from "@mui/material";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { IoMdClose } from "react-icons/io";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {  setLoading, setadminAddVehicleSuccess, setadminCrudError } from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";
import { fetchModelData, fetchHierarchicalLocationData, fetchHierarchicalCarData } from "../../../utils/fetchModelData";

const AddProductModal = () => {
  const { register, handleSubmit, control , reset, watch, setValue } = useForm({
    defaultValues: {
      registeration_number: "",
      company: "",
      name: "",
      model: "",
      title: "",
      base_package: "",
      price: "",
      year_made: "",
      fuelType: "",
      carType: "",
      Seats: "",
      transmitionType: "",
      vehicleState: "",
      vehicleDistrict: "",
      vehicleCity: "",
      vehicleLocation: "",
      description: "",
      insurance_end_date: null,
      Registeration_end_date: null,
      polution_end_date: null
    }
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);
  const {loading} = useSelector(state => state.statusSlice);

  // New state for hierarchical location data
  const [locationHierarchy, setLocationHierarchy] = useState({
    states: [],
    districts: [],
    cities: [],
    locations: []
  });
  const [locationHelper, setLocationHelper] = useState(null);

  // New state for hierarchical car data
  const [carHierarchy, setCarHierarchy] = useState({
    brands: [],
    models: [],
    variants: []
  });
  const [carHelper, setCarHelper] = useState(null);

  // Watch form values for cascading dropdowns
  const selectedState = watch("vehicleState");
  const selectedDistrict = watch("vehicleDistrict");
  const selectedCity = watch("vehicleCity");
  const selectedBrand = watch("company");
  const selectedModel = watch("model");

  useEffect(() => {
    fetchModelData(dispatch);
    dispatch(addVehicleClicked(true));
    
    // Fetch hierarchical location data
    const loadLocationData = async () => {
      const helper = await fetchHierarchicalLocationData();
      if (helper) {
        setLocationHelper(helper);
        setLocationHierarchy(prev => ({
          ...prev,
          states: helper.states
        }));
      }
    };

    // Fetch hierarchical car data
    const loadCarData = async () => {
      const helper = await fetchHierarchicalCarData();
      if (helper) {
        setCarHelper(helper);
        setCarHierarchy(prev => ({
          ...prev,
          brands: helper.brands
        }));
      }
    };
    
    loadLocationData();
    loadCarData();
  }, [dispatch]);

  // Update districts when state changes
  useEffect(() => {
    if (selectedState && locationHelper) {
      const districts = locationHelper.getDistrictsByState(selectedState);
      setLocationHierarchy(prev => ({
        ...prev,
        districts,
        cities: [],
        locations: []
      }));
      // Reset dependent fields
      setValue("vehicleDistrict", "");
      setValue("vehicleCity", "");
      setValue("vehicleLocation", "");
    }
  }, [selectedState, locationHelper, setValue]);

  // Update cities when district changes
  useEffect(() => {
    if (selectedState && selectedDistrict && locationHelper) {
      const cities = locationHelper.getCitiesByStateAndDistrict(selectedState, selectedDistrict);
      setLocationHierarchy(prev => ({
        ...prev,
        cities,
        locations: []
      }));
      // Reset dependent fields
      setValue("vehicleCity", "");
      setValue("vehicleLocation", "");
    }
  }, [selectedState, selectedDistrict, locationHelper, setValue]);

  // Update locations when city changes
  useEffect(() => {
    if (selectedState && selectedDistrict && selectedCity && locationHelper) {
      const locations = locationHelper.getLocationsByStateDistrictAndCity(selectedState, selectedDistrict, selectedCity);
      setLocationHierarchy(prev => ({
        ...prev,
        locations
      }));
      // Reset location field
      setValue("vehicleLocation", "");
    }
  }, [selectedState, selectedDistrict, selectedCity, locationHelper, setValue]);

  // Update models when brand changes
  useEffect(() => {
    if (selectedBrand && carHelper) {
      const models = carHelper.getModelsByBrand(selectedBrand);
      setCarHierarchy(prev => ({
        ...prev,
        models,
        variants: []
      }));
      // Reset dependent fields
      setValue("model", "");
    }
  }, [selectedBrand, carHelper, setValue]);

  // Update variants when model changes
  useEffect(() => {
    if (selectedBrand && selectedModel && carHelper) {
      const variants = carHelper.getVariantsByBrandAndModel(selectedBrand, selectedModel);
      setCarHierarchy(prev => ({
        ...prev,
        variants
      }));
    }
  }, [selectedBrand, selectedModel, carHelper, setValue]);

  const onSubmit = async (addData) => {
    // Validate vehicle images are uploaded
    if (!addData.image || addData.image.length === 0) {
      console.error("Vehicle images are mandatory. Please upload at least one vehicle image.");
      return;
    }
   
    try {
      const img = [];
      for (let i = 0; i < addData.image.length; i++) {
        img.push(addData.image[i]);
      }
      const formData = new FormData();
      formData.append("registeration_number", addData.registeration_number);
      formData.append("company", addData.company);
      img.forEach((file) => {
        formData.append(`image`, file); // Append each file with a unique key
      });
      formData.append("name", addData.name);
      formData.append("model", addData.model);
      formData.append("title", addData.title);
      formData.append("base_package", addData.base_package);
      formData.append("price", addData.price);
      formData.append("description", addData.description);
      formData.append("year_made", addData.year_made);
      formData.append("fuel_type", addData.fuelType);
      formData.append("seat", addData.Seats);
      formData.append("transmition_type", addData.transmitionType);
      
      // Optional date fields
      if (addData.insurance_end_date && addData.insurance_end_date.$d) {
        formData.append("insurance_end_date", addData.insurance_end_date.$d);
      }
      if (addData.Registeration_end_date && addData.Registeration_end_date.$d) {
        formData.append("registeration_end_date", addData.Registeration_end_date.$d);
      }
      if (addData.polution_end_date && addData.polution_end_date.$d) {
        formData.append("polution_end_date", addData.polution_end_date.$d);
      }
      
      formData.append("car_type", addData.carType);
      formData.append("state", addData.vehicleState);
      formData.append("district", addData.vehicleDistrict);
      formData.append("city", addData.vehicleCity);
      formData.append("location", addData.vehicleLocation);
   

      let tostID;
      if (formData) {
        tostID = toast.loading("saving...", { position: "bottom-center" });
        dispatch(setLoading(true))
      }
      const res = await fetch("/api/admin/addProduct", {
        method: "POST",
        body:formData
      });

      if (!res.ok) {
        toast.error("error");
        toast.dismiss(tostID);
        dispatch(setLoading(false))
      }
      if (res.ok) {
        dispatch(setadminAddVehicleSuccess(true));
        toast.dismiss(tostID)
        dispatch(setLoading(false))
      }

      reset();
    } catch (error) {
      dispatch(setadminCrudError(true))
      console.log(error);
    }
    dispatch(addVehicleClicked(false));
    navigate("/adminDashboard/allProduct");
  };

  const handleClose = () => {
    navigate("/adminDashboard/allProduct");
  };

  return (
    <>
    {loading  ? <Toaster/> : null }
      {isAddVehicleClicked && (
        <div className="min-h-screen relative overflow-hidden">
          {/* Animated Tourism Background */}
          <div className="absolute inset-0 z-0">
            {/* Sky Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-300 to-orange-200"></div>
            
            {/* Animated Clouds */}
            <div className="absolute top-10 left-0 w-full h-32 opacity-80">
              <div className="cloud cloud-1 absolute top-4 bg-white rounded-full w-24 h-8 animate-float-slow"></div>
              <div className="cloud cloud-2 absolute top-8 bg-white rounded-full w-32 h-10 animate-float-medium"></div>
              <div className="cloud cloud-3 absolute top-2 bg-white rounded-full w-20 h-6 animate-float-fast"></div>
            </div>
            
            {/* Mountains */}
            <div className="absolute bottom-0 left-0 w-full">
              <svg viewBox="0 0 1200 300" className="w-full h-64 opacity-70">
                <polygon points="0,300 200,100 400,180 600,80 800,160 1000,60 1200,140 1200,300" fill="#4a5568" className="animate-pulse-slow"/>
                <polygon points="0,300 150,150 350,200 550,120 750,180 950,100 1200,160 1200,300" fill="#2d3748" className="animate-pulse-slower"/>
              </svg>
            </div>
            
            {/* Animated Trees */}
            <div className="absolute bottom-16 left-10 w-8 h-16 bg-green-600 rounded-t-full animate-sway"></div>
            <div className="absolute bottom-16 left-20 w-6 h-12 bg-green-700 rounded-t-full animate-sway-reverse"></div>
            <div className="absolute bottom-16 right-20 w-10 h-20 bg-green-600 rounded-t-full animate-sway"></div>
            <div className="absolute bottom-16 right-40 w-7 h-14 bg-green-700 rounded-t-full animate-sway-reverse"></div>
            
            {/* Animated Birds */}
            <div className="absolute top-20 left-1/4 animate-fly">
              <div className="w-2 h-1 bg-gray-800 rounded-full transform rotate-12"></div>
              <div className="w-2 h-1 bg-gray-800 rounded-full transform -rotate-12 ml-1 -mt-1"></div>
            </div>
            <div className="absolute top-32 right-1/3 animate-fly-reverse">
              <div className="w-2 h-1 bg-gray-800 rounded-full transform rotate-12"></div>
              <div className="w-2 h-1 bg-gray-800 rounded-full transform -rotate-12 ml-1 -mt-1"></div>
            </div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0">
              <div className="particle particle-1 absolute w-1 h-1 bg-yellow-300 rounded-full animate-float-particle"></div>
              <div className="particle particle-2 absolute w-1 h-1 bg-yellow-200 rounded-full animate-float-particle-slow"></div>
              <div className="particle particle-3 absolute w-1 h-1 bg-orange-300 rounded-full animate-float-particle-fast"></div>
            </div>
          </div>

          {/* Close Button */}
          <button onClick={handleClose} className="absolute top-4 right-4 z-50">
            <div className="p-2 rounded-full bg-white/90 backdrop-blur-sm drop-shadow-md hover:shadow-lg hover:bg-red-100 transition-all duration-200">
              <IoMdClose style={{ fontSize: "24px" }} />
            </div>
          </button>

          {/* Form Container */}
          <div className="relative z-10 p-2 w-full min-h-screen flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-8 w-full max-w-[95vw] max-h-[95vh] overflow-y-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Add New Vehicle</h2>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box
                  sx={{
                    "& .MuiTextField-root": {
                      m: 1,
                      width: "280px",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        "& fieldset": {
                          borderColor: "#d1d5db",
                        },
                        "&:hover fieldset": {
                          borderColor: "#3b82f6",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#3b82f6",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#000000",
                        fontWeight: "bold",
                      },
                      "& .MuiInputBase-input": {
                        color: "#000000",
                        fontWeight: "bold",
                      },
                      "& .MuiSelect-select": {
                        color: "#000000",
                        fontWeight: "bold",
                      },
                      "& .MuiMenuItem-root": {
                        color: "#000000",
                        fontWeight: "bold",
                      },
                      "@media (max-width: 640px)": {
                        width: "240px",
                        m: 0.5,
                      },
                    },
                  }}
                  noValidate
                  autoComplete="off"
                >
                  {/* Row 1 - Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    <TextField
                      required
                      id="registeration_number"
                      label="Registration Number"
                      size="small"
                      {...register("registeration_number")}
                    />

                    <Controller
                      control={control}
                      name="company"
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="company"
                          select
                          label="Brand"
                          size="small"
                          value={field.value || ""}
                          error={Boolean(field.value === "")}
                        >
                          {carHierarchy.brands.map((brand, idx) => (
                            <MenuItem value={brand} key={idx}>
                              {brand}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <TextField
                      required
                      id="name"
                      label="Vehicle Name"
                      size="small"
                      {...register("name")}
                    />

                    <Controller
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="model"
                          select
                          label="Model"
                          size="small"
                          disabled={!selectedBrand}
                          error={Boolean(field.value == "")}
                        >
                          {carHierarchy.models.map((model, idx) => (
                            <MenuItem value={model} key={idx}>
                              {model}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </div>

                  {/* Row 2 - Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    <TextField 
                      id="title" 
                      label="Title" 
                      size="small"
                      {...register("title")} 
                    />
                    
                    <TextField
                      id="base_package"
                      label="Base Package"
                      size="small"
                      {...register("base_package")}
                    />
                    
                    <TextField
                      id="price"
                      type="number"
                      label="Price per Day"
                      size="small"
                      {...register("price")}
                    />

                    <TextField
                      required
                      id="year_made"
                      type="number"
                      label="Year Made"
                      size="small"
                      {...register("year_made")}
                    />
                  </div>

                  {/* Row 3 - Specifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    <Controller
                      control={control}
                      name="fuelType"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="fuel_type"
                          select
                          label="Fuel Type"
                          size="small"
                          error={Boolean(field.value == "")}
                        >
                          <MenuItem value={"petrol"}>Petrol</MenuItem>
                          <MenuItem value={"diesel"}>Diesel</MenuItem>
                          <MenuItem value={"electric"}>Electric</MenuItem>
                          <MenuItem value={"hybrid"}>Hybrid</MenuItem>
                        </TextField>
                      )}
                    />

                    <Controller
                      name="carType"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="car_type"
                          select
                          label="Car Type"
                          size="small"
                          error={Boolean(field.value === "")}
                        >
                          <MenuItem value="sedan">Sedan</MenuItem>
                          <MenuItem value="suv">SUV</MenuItem>
                          <MenuItem value="hatchback">Hatchback</MenuItem>
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="Seats"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="seats"
                          select
                          label="Seats"
                          size="small"
                          error={Boolean(field.value === "")}
                        >
                          <MenuItem value={"5"}>5 Seater</MenuItem>
                          <MenuItem value={"7"}>7 Seater</MenuItem>
                          <MenuItem value={"8"}>8 Seater</MenuItem>
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="transmitionType"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="transmittion_type"
                          select
                          label="Transmission"
                          size="small"
                          error={Boolean(field.value == "")}
                        >
                          <MenuItem value={"automatic"}>Automatic</MenuItem>
                          <MenuItem value={"manual"}>Manual</MenuItem>
                        </TextField>
                      )}
                    />
                  </div>

                  {/* Row 4 - Hierarchical Location Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    <Controller
                      control={control}
                      name="vehicleState"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="vehicleState"
                          select
                          label="State"
                          size="small"
                          error={Boolean(field.value === "")}
                        >
                          {locationHierarchy.states.map((state, idx) => (
                            <MenuItem value={state} key={idx}>
                              {state}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="vehicleDistrict"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="vehicleDistrict"
                          select
                          label="District"
                          size="small"
                          disabled={!selectedState}
                          error={Boolean(field.value === "")}
                        >
                          {locationHierarchy.districts.map((district, idx) => (
                            <MenuItem value={district} key={idx}>
                              {district}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="vehicleCity"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="vehicleCity"
                          select
                          label="City"
                          size="small"
                          disabled={!selectedDistrict}
                          error={Boolean(field.value === "")}
                        >
                          {locationHierarchy.cities.map((city, idx) => (
                            <MenuItem value={city} key={idx}>
                              {city}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      control={control}
                      name="vehicleLocation"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          id="vehicleLocation"
                          select
                          label="Vehicle Location"
                          size="small"
                          disabled={!selectedCity}
                          error={Boolean(field.value === "")}
                        >
                          {locationHierarchy.locations.map((location, idx) => (
                            <MenuItem value={location} key={idx}>
                              {location}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </div>

                  {/* Row 5 - Description */}
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <TextField
                      id="description"
                      label="Description"
                      multiline
                      rows={2}
                      size="small"
                      sx={{ width: "100%" }}
                      {...register("description")}
                    />
                  </div>

                  {/* Row 6 - Dates (Optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                    <Controller
                      name="insurance_end_date"
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Insurance End Date (Optional)"
                            slotProps={{ 
                              textField: { 
                                size: 'small',
                                sx: { 
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                  },
                                  '& .MuiInputLabel-root': {
                                    color: '#000000',
                                    fontWeight: 'bold',
                                  },
                                  '& .MuiInputBase-input': {
                                    color: '#000000',
                                    fontWeight: 'bold',
                                  }
                                }
                              } 
                            }}
                            value={field.value || null}
                            onChange={(date) => field.onChange(date)}
                          />
                        </LocalizationProvider>
                      )}
                    />

                    <Controller
                      control={control}
                      name="Registeration_end_date"
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Registration End Date (Optional)"
                            slotProps={{ 
                              textField: { 
                                size: 'small',
                                sx: { 
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                  },
                                  '& .MuiInputLabel-root': {
                                    color: '#000000',
                                    fontWeight: 'bold',
                                  },
                                  '& .MuiInputBase-input': {
                                    color: '#000000',
                                    fontWeight: 'bold',
                                  }
                                }
                              } 
                            }}
                            value={field.value || null}
                            onChange={(date) => field.onChange(date)}
                          />
                        </LocalizationProvider>
                      )}
                    />

                    <Controller
                      control={control}
                      name="polution_end_date"
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            {...field}
                            label="Pollution End Date (Optional)"
                            slotProps={{ 
                              textField: { 
                                size: 'small',
                                sx: { 
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                  },
                                  '& .MuiInputLabel-root': {
                                    color: '#000000',
                                    fontWeight: 'bold',
                                  },
                                  '& .MuiInputBase-input': {
                                    color: '#000000',
                                    fontWeight: 'bold',
                                  }
                                }
                              } 
                            }}
                            value={field.value || null}
                            onChange={(date) => field.onChange(date)}
                          />
                        </LocalizationProvider>
                      )}
                    />
                  </div>

                  {/* File Upload Section - Compact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block mb-2 text-sm font-bold text-black">
                        Insurance Image (Optional)
                      </label>
                      <input
                        className="block w-full text-sm text-black font-bold border border-gray-300 rounded-lg cursor-pointer bg-white/90 focus:outline-none"
                        id="insurance_image"
                        type="file"
                        multiple
                        {...register("insurance_image")}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-bold text-black">
                        RC Book Image (Optional)
                      </label>
                      <input
                        className="block w-full text-sm text-black font-bold border border-gray-300 rounded-lg cursor-pointer bg-white/90 focus:outline-none"
                        id="rc_book_image"
                        type="file"
                        multiple
                        {...register("rc_book_image")}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-bold text-black">
                        Pollution Certificate (Optional)
                      </label>
                      <input
                        className="block w-full text-sm text-black font-bold border border-gray-300 rounded-lg cursor-pointer bg-white/90 focus:outline-none"
                        id="polution_image"
                        type="file"
                        multiple
                        {...register("polution_image")}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-bold text-black">
                        Vehicle Images (Mandatory) *
                      </label>
                      <input
                        className="block w-full text-sm text-black font-bold border border-red-300 rounded-lg cursor-pointer bg-red-50/90 focus:outline-none focus:border-red-500"
                        id="image"
                        type="file"
                        multiple
                        required
                        {...register("image", { required: "Vehicle images are mandatory" })}
                      />
                      <p className="text-xs text-black font-bold mt-1">At least one vehicle image is required</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <Button 
                      variant="contained" 
                      type="submit"
                      size="large"
                      sx={{
                        backgroundColor: '#3b82f6',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                        },
                        px: 4,
                        py: 1.5
                      }}
                    >
                      Add Vehicle
                    </Button>
                  </div>
                </Box>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductModal;
