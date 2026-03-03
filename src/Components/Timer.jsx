import Moon from "../../public/images/alt-moon.svg";
import Sun from "../../public/images/alt-sun.svg";

const Timer = ({ timer, currentPhase }) => {

  return (
    <>
      <div id="column">
        {currentPhase === "night" ? (
          <>
            <div style={{ width: "50%", display: "inline-block", verticalAlign: "bottom" }}>
              <div style={{ textAlign: "center" }}>Timer</div>
              <div style={{ textAlign: "center", fontSize: "3em" }}>{timer}</div>
            </div>
            <div style={{ display: "inline-block" }}>
              < img src={Moon} style={{ height: "113px", padding: "9px", verticalAlign: "bottom" }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: "50%", display: "inline-block", verticalAlign: "bottom" }}>
              <div style={{ textAlign: "center" }}>Timer</div>
              <div style={{ textAlign: "center", fontSize: "3em" }}>{timer}</div>
            </div>
            <div style={{ display: "inline-block" }}>
              < img src={Sun} style={{ height: "113px", padding: "9px", verticalAlign: "bottom" }} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Timer;
