import {
  setModelData,
  setCompanyData,
  setLocationData,
  setDistrictData,
} from "../redux/adminSlices/adminDashboardSlice/CarModelDataSlice";
import { setWholeData } from "../redux/user/selectRideSlice";

export const fetchModelData = async (dispatch) => {
  try {
    const res = await fetch("/api/admin/getVehicleModels", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();

      //getting models from data
      const models = data
        .filter((cur) => cur.type === "car")
        .map((cur) => cur.model);
      dispatch(setModelData(models));

      //getting comapnys from data
      const brand = data
        .filter((cur) => cur.type === "car")
        .map((cur) => cur.brand);
      const uniqueBrand = brand.filter((cur, index) => {
        return brand.indexOf(cur) === index;
      });
      dispatch(setCompanyData(uniqueBrand));

      //getting locations from data
      const locations = data
        .filter((cur) => cur.type === "location")
        .map((cur) => cur.location);
      dispatch(setLocationData(locations));

      //getting districts from data
      const districts = data
        .filter((cur) => cur.type === "location")
        .map((cur) => cur.district);
      const uniqueDistricts = districts.filter((cur, idx) => {
        return districts.indexOf(cur) === idx;
      });
      dispatch(setDistrictData(uniqueDistricts));

      //setting whole data
      const wholeData = data.filter((cur) => cur.type === "location");
      dispatch(setWholeData(wholeData));
    } else {
      return "no data found";
    }
  } catch (error) {
    console.log(error);
  }
};

// New function to fetch hierarchical location data
export const fetchHierarchicalLocationData = async () => {
  try {
    const res = await fetch("/api/admin/getVehicleModels", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      const locationData = data.filter((cur) => cur.type === "location");
      
      // Extract unique states
      const states = [...new Set(locationData.map(item => item.state))].filter(Boolean);
      
      return {
        states,
        locationData,
        getDistrictsByState: (state) => {
          return [...new Set(locationData
            .filter(item => item.state === state)
            .map(item => item.district))].filter(Boolean);
        },
        getCitiesByStateAndDistrict: (state, district) => {
          return [...new Set(locationData
            .filter(item => item.state === state && item.district === district)
            .map(item => item.city))].filter(Boolean);
        },
        getLocationsByStateDistrictAndCity: (state, district, city) => {
          return locationData
            .filter(item => 
              item.state === state && 
              item.district === district && 
              (item.city === city || !city)
            )
            .map(item => item.location)
            .filter(Boolean);
        }
      };
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

// New function to fetch hierarchical car data
export const fetchHierarchicalCarData = async () => {
  try {
    const res = await fetch("/api/admin/getVehicleModels", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      const carData = data.filter((cur) => cur.type === "car");
      
      // Extract unique brands
      const brands = [...new Set(carData.map(item => item.brand))].filter(Boolean);
      
      return {
        brands,
        carData,
        getModelsByBrand: (brand) => {
          return [...new Set(carData
            .filter(item => item.brand === brand)
            .map(item => item.model))].filter(Boolean);
        },
        getVariantsByBrandAndModel: (brand, model) => {
          return carData
            .filter(item => item.brand === brand && item.model === model)
            .map(item => item.variant)
            .filter(Boolean);
        }
      };
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};