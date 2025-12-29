import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setEditData } from "../../../redux/adminSlices/actions";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { Button } from "@mui/material";
import { Header } from "../components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";

import Box from "@mui/material/Box";
import { showVehicles } from "../../../redux/user/listAllVehicleSlice";
import {
  clearAdminVehicleToast,
} from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";

function AllVehicles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);

  const [allVehicles, setVehicles] = useState([]);
  const { adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError } =
    useSelector((state) => state.statusSlice);

  //show vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/admin/showVehicles", {
          method: "GET",
        });
        if (res.ok) {
          const data = await res.json();
          setVehicles(data);
          dispatch(showVehicles(data));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchVehicles();
  }, [isAddVehicleClicked]);

  //delete a vehicle
  const handleDelete = async (vehicle_id) => {
    try {
      setVehicles(allVehicles.filter((cur) => cur._id !== vehicle_id));
      const res = await fetch(`/api/admin/deleteVehicle/${vehicle_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("deleted", {
          duration: 800,

          style: {
            color: "white",
            background: "#c48080",
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //edit vehicles
  const handleEditVehicle = (vehicle_id) => {
    dispatch(setEditData({ _id: vehicle_id }));
    navigate(`/adminDashboard/editProducts?vehicle_id=${vehicle_id}`);
  };

  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 120,
      renderCell: (params) => (
        <img
          src={params.value}
          style={{
            width: "60px",
            height: "45px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
          alt="vehicle"
        />
      ),
    },
    {
      field: "registeration_number",
      headerName: "Registration Number",
      width: 200,
      flex: 1,
    },
    { 
      field: "company", 
      headerName: "Company", 
      width: 180,
      flex: 1,
    },
    { 
      field: "name", 
      headerName: "Vehicle Name", 
      width: 200,
      flex: 1,
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Button 
          onClick={() => handleEditVehicle(params.row.id)}
          sx={{ 
            minWidth: 'auto', 
            padding: '8px',
            color: '#3b82f6',
            '&:hover': {
              backgroundColor: '#eff6ff',
            }
          }}
        >
          <ModeEditOutlineIcon fontSize="small" />
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Button 
          onClick={() => handleDelete(params.row.id)}
          sx={{ 
            minWidth: 'auto', 
            padding: '8px',
            color: '#ef4444',
            '&:hover': {
              backgroundColor: '#fef2f2',
            }
          }}
        >
          <DeleteForeverIcon fontSize="small" />
        </Button>
      ),
    },
  ];

  const rows = allVehicles
    .filter(
      (vehicle) => vehicle.isDeleted === "false" && vehicle.isAdminApproved
    )
    .map((vehicle) => ({
      id: vehicle._id,
      image: vehicle.image[0],
      registeration_number: vehicle.registeration_number,
      company: vehicle.company,
      name: vehicle.name,
    }));

  //edit success
  useEffect(() => {
    if (adminEditVehicleSuccess) {
      toast.success("success");
    }
    else if (adminAddVehicleSuccess) {
      toast.success("success");
    }
    else if(adminCrudError){
     toast.error("error")
    }
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess,adminCrudError,dispatch]);

  useEffect(() => {
    const clearNotificationsTimeout = setTimeout(() => {
      dispatch(clearAdminVehicleToast());
    }, 3000);
  
    return () => clearTimeout(clearNotificationsTimeout);
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError, dispatch]);

  return (
    <>
      {adminEditVehicleSuccess ? <Toaster /> : ''} 
      {adminAddVehicleSuccess ? <Toaster /> : ''}
      {adminCrudError ? <Toaster/> : ""}     
        
      <div className="w-full h-full">
        <div className="mb-6">
          <Header title="AllVehicles" />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 8,
                  },
                },
              }}
              pageSizeOptions={[5, 8, 10, 20]}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{
                ".MuiDataGrid-columnSeparator": {
                  display: "none",
                },
                "&.MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f0f0f0",
                  fontWeight: "bold",
                  color: "#000000",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                  fontWeight: "bold",
                  color: "#000000",
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f8fafc",
                },
                "& .MuiDataGrid-footerContainer": {
                  "& .MuiTablePagination-root": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                  "& .MuiTablePagination-selectLabel": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                  "& .MuiTablePagination-displayedRows": {
                    fontWeight: "bold",
                    color: "#000000",
                  },
                },
              }}
            />
          </Box>
        </div>
      </div>
    </>
  );
}

export default AllVehicles;
