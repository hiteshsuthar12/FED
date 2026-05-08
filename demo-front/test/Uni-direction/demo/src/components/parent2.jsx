import React from "react";
import Child2 from "./Child2";

const parent2 = () =>{

    return(

        <div>
            <h1>Parent Component</h1>

            <Child2 keys1= "Hello" keys2={2026}></Child2>
        </div>
    );
};

export default parent2;