import styles from "../../index";
import poloRedCar from "../../Assets/polo-red-car.jpeg";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate()

  return (
    <>
      {/* This is div is the container for the dot background */}
      <div className="relative h-[100vh] w-full mx-auto sm:max-w-[900px] lg:max-w-[1500px] bg-white min-h-[100vh] overflow-hidden">
        <div
          className={`px-12 lg:px-28 absolute top-0   z-10 w-full   justify-between items-center flex flex-col  sm:flex-row mt-[50px] md:mt-[170px] gap-10`}
        >
          <div className="">
            <p className={`py-2 text-[9px] md:text-[12px] ${styles.paragraph}`}>
              Plan your trip now
            </p>
            <h1
              className={` md:${styles.heading2} font-extrabold text-[45px] leading-12 lg:font-bold  mb-8  lg:text-[72px] lg:mb-10`}
            >
              Save <span className="text-green-600">big</span> with our <br />
              car rental
            </h1>
            <p className={`${styles.paragraph} text-justify mb-8`}>
              Rent the car of your dreams. Unbeatable prices, unlimited miles,
              flexible pick-up options and much more.
            </p>
            <div className=" mt-16  lg:mt-[60px] flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('/cross-state-booking')}
                className="bg-green-600 text-white rounded-lg text-[16px] md:text-[20px] lg:text-[24px] px-6 py-4 lg:py-6 lg:px-10 hover:bg-green-700 transition-colors font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Book Now{" "}
                <span className="ml-2">
                  <i className="bi bi-globe text-lg"></i>
                </span>
              </button>
            </div>
          </div>
          <div className="object-contain hidden sm:block">
            <img src={poloRedCar} alt="Red Polo Car" className="w-full h-auto max-w-md rounded-lg shadow-lg" />
          </div>
        </div>
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>
    </>
  );
}

export default Home;
