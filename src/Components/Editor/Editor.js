import React, { useEffect, useContext, useRef, useState } from "react";
import { CodeMirrorBinding } from "./EditorAdaptor";
import { UnControlled as CodeMirrorEditor } from "react-codemirror2";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { useLocation } from "react-router-dom";
import Modal from "../Modal/Modal";
import Graph from "../Graph/Graph";
import { connect } from "react-redux";
import { SET_LOADING, SET_OUTPUT } from "../../store/Action/action";

import "./EditorAddons";

function Editor(props) {
  const location = useLocation();
  const [EditorRef, setEditorRef] = useState(null);
  const [code,setCode] = useState("");

  const socket = props.socket;

  const handleEditorDidMount = (editor) => {
    setEditorRef(editor);
  };

  useEffect(async () => {
  if (props.tools.nowCompile === true && props.tools.isLoading === false) {
      props.setOutput("");
      props.setLoading();
      socket.emit("Compile_ON", {
        language: props.tools.language,
        code,
        input: props.tools.input,
        reason:"code-editor"
      });
    }
  }, [props.tools.nowCompile]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    if (EditorRef) {
      const ydoc = new Y.Doc();

      let provider;
      try {
        provider = new WebrtcProvider(searchParams.get("room").trim(), ydoc, {
          signaling: [
            "wss://signaling.yjs.dev",
            "wss://y-webrtc-signaling-eu.herokuapp.com",
            "wss://y-webrtc-signaling-us.herokuapp.com",
          ],
        });
      } catch (err) {
        console.log("error in collaborating try again");
      }

      const yText = ydoc.getText("codemirror");
      const yUndoManager = new Y.UndoManager(yText);

      const awareness = provider?.awareness;
      const val = "#4287f5";
      awareness?.setLocalStateField("user", {
        name: searchParams.get("name").trim(),
        color: val, // should be a hex color: ;
      });
      const getBinding = new CodeMirrorBinding(yText, EditorRef, awareness, {
        yUndoManager,
      });

      return () => {
        if (provider) {
          provider.disconnect();
        }
      };
    }
  }, [EditorRef]);

  return (
    <>
      <CodeMirrorEditor
        value={code}
        onChange={(editor, data, value) => {
          setCode(value)
        }}
        autoScroll
        options={{
          mode: "C++",
          lineWrapping: true,
          smartIndent: true,
          lineNumbers: true,
          foldGutter: true,
          tabSize: 2,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          autoCloseTags: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          extraKeys: {
            "Ctrl-Space": "autocomplete",
          },
        }}
        editorDidMount={(editor) => {
          handleEditorDidMount(editor);
          editor.setSize("100%", "100%");
        }}
      />
      {props.tools.isLoading === true ? <Modal /> : null}
      {props.tools.showGraph === true ? <Graph /> : null}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    ...state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setOutput: (value) => dispatch({ type: SET_OUTPUT, value }),
    setLoading: () => dispatch({ type: SET_LOADING }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
