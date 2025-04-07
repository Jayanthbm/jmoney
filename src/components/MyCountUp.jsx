import CountUp from "react-countup";
import { formatIndianNumber } from "../utils";

const MyCountUp = ({ end }) => {
  return (
    <CountUp
      end={end}
      duration={1.5}
      formattingFn={formatIndianNumber}
      enableScrollSpy
      scrollSpyDelay={100}
    />
  );
};

export default MyCountUp;
