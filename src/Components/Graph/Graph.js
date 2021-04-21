import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import { HIDE_GRAPH } from "../../store/Action/action";
import { Grid, makeStyles, Button, InputLabel } from "@material-ui/core";

const options = {
  layout: {
    hierarchical: false,
  },
  edges: {
    color: "#000000",
  },
};

const GraphVis = (props) => {
  const [inputText, setInputText] = useState("");
  const [graphKey, setGraphKey] = useState(uuidv4());

  const [graph, setGraph] = useState({nodes:[],edges:[]});

  const changeHandler = async (e) => {
    setInputText(e.target.value);
  };

  useEffect(() => {
    setGraphKey(uuidv4());
    let text = inputText.replace(/\D/g, " ").split(" ");

    const index = text.indexOf("");
    if (index > -1) {
      text.splice(index, 1);
    }

    const nodes = [...new Set(text)].map((num, key) => {
      return { id: parseInt(num), key: key, label: num, color: "#e09c41" };
    });

    const edges = [];
    for (let i = 0; i < text.length; i += 2) {
      if (i + 1 < text.length) {
        edges.push({ from: parseInt(text[i]), to: parseInt(text[i + 1]) });
      }
    }

    setGraph({
      nodes,
      edges,
    });
  }, [inputText]);

  return (
    <Grid
    direction="column"
    style={{
      position: "fixed",
      zIndex: "400",
      backgroundColor: "black",
      height: "60vh",
      width: "100vh",
      //border: "1px solid #ccc",
      boxShadow: "1px 1px 1px black",
      background: "rgb(39, 41, 43,0.8)",
      padding: "2vh",
      left: "28%",
      top: "20%",
      //display: "flex",
      //justifyContent: "center",
      //boxSizing: "border-box",
      transition: "all 0.3s ease-out",
    }}
  >
      <button onClick={props.onClickGraph}>X</button>
      <Grid container direction="rows" style={{ border: "4px solid green" }}>
        <Grid xs={3}>
          <textarea
            placeHolder="Graph Input..."
            rows={17}
            onChange={changeHandler}
            style={{ width: "95%", resize: "none", fontSize: 20 }}
          ></textarea>
        </Grid>
        <Grid xs={9}>
          <Graph
            graph={graph}
            options={options}
            key={graphKey}
            style={{
              height: "55vh",
              width: "100%",
              backgroundColor: "lightblue",
              border: "green",
            }}
          />
        </Grid>
      </Grid>
      </Grid>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClickGraph: () => dispatch({ type: HIDE_GRAPH }),
  };
};

export default connect(null, mapDispatchToProps)(GraphVis);