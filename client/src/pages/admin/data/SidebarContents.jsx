
import { AiOutlineCalendar, AiOutlineShoppingCart } from 'react-icons/ai';
import { FiShoppingBag, FiEdit } from 'react-icons/fi';
import { BsKanban } from 'react-icons/bs';
import { BiColorFill } from 'react-icons/bi';
import { IoMdContacts } from 'react-icons/io';
import { RiContactsLine, RiStockLine } from 'react-icons/ri';
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineAnalytics } from 'react-icons/md';




export const links = [
    {
      title: 'Dashboard',
      links: [
        {
          name:'adminHome',
          icon:<IoHomeOutline />,
        },
        {
          name: 'allVehicles',
          icon: <FiShoppingBag />,
        },
        {
          name: 'vendorVehicleRequests',
          icon: <FiShoppingBag />,
        },
        
      ],
    },
  
    {
      title: 'Pages',
      links: [
        {
          name: 'orders',
          icon: <AiOutlineShoppingCart />,
        },
        {
          name: 'allUsers',
          icon: <IoMdContacts />,
        },
        {
          name: 'customers',
          icon: <RiContactsLine />,
        },
        {
          name: 'profile',
          icon: <IoMdContacts />,
        },
      ],
    },
    {
        title: 'Analytics',
        links: [
          {
            name: 'financial',
            icon: <RiStockLine />,
          },
          {
            name: 'travelAnalytics',
            icon: <MdOutlineAnalytics />,
          },
        ],
      },
     
    ];
    