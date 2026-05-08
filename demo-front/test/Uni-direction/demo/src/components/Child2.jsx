import React from "react";

const Child2  = (props)  => {

    return(

        <div>
            <h2>Child  Component</h2>
            <p>keys1: {props.keys1}</p>
            <p>keys2: {props.keys2}</p>
        </div>
    );
};

export default Child2;