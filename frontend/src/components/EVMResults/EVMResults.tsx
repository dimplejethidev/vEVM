import { useProvider, useContract } from "wagmi";
import { useEffect, useState, useMemo } from "react";

import { ethers } from "ethers";

const evm_address = "0xbf42398B6c3DF1F01b2848E6B16B8bcC62029D84";

import evm_abi from "../../../abi/vEVM.json";

type vEVMState = {
  code: string;
  pc: string;
  stack: string[];
  mem: string;
  storageKey: string[];
  storageData: string[];
  logs: string[];
  output: string;
};

export function EVMResults(props: any) {
  const provider = useProvider();
  const evm = useContract({
    address: evm_address,
    abi: evm_abi.abi,
    signerOrProvider: provider,
  });
  const [results, setResults] = useState(null);

  //   console.log("  code:", state.code);
  //   console.log("    pc:", parseInt(state.pc));
  //   console.log("output:", state.output);
  //   console.log(" stack:", state.stack);
  //   console.log("   mem:", chunkSubstr(state.mem, 64));
  //   console.log("  skey:", state.storageKey);
  //   console.log(" sdata:", state.storageData);

  const renderResults = () => {
    if (results) {
      const res: vEVMState = results;

      const stack_array = res.stack.map((stack_slot, index) => (
        <li key={index}>
          {" "}
          [{index}] {stack_slot.slice(2)}
        </li>
      ));
      const mem_temp = res.mem.slice(2).match(/.{1,64}/g) || [];
      const mem_array = mem_temp.map((mem_slot, index) => (
        <li key={index}>
          {" "}
          [{index}] {mem_slot}
        </li>
      ));

      const storage_size = res.storageKey.length;
      const storage_map = [];
      for (let i = 0; i < storage_size; i++) {
        storage_map.push({ key: res.storageKey, data: res.storageData });
      }
      const storage_array = storage_map.map((slot, index) => (
        <li key={index}>
          {" "}
          [{slot.key}] :{slot.data}
        </li>
      ));

      const logs_size = res.logs.length;
      const logs_map = [];
      for (let i = 0; i < logs_size; i++) {
        logs_map.push(res.logs[i].slice(2).match(/.{1,64}/g) || []);
      }
      const logs_array = logs_map.map((log, index) => (
        <li key={index}>
          {" "}
          [{index}] {log}
        </li>
      ));

      // for(let i = 0; i < res.stack.length; i++) {
      // 	console.log(res.stack[i]);
      // }

      return (
        <div className="results">
          <h2>results</h2>
          <div className="container-terminal">
            <h3>code</h3>
            <p>{res.code}</p>
            {/* <p>{results.pc}</p> */}
            <h3>output</h3>
            <p>{res.output}</p>
            <h3>stack</h3>
            <ul>{stack_array}</ul>
            <h3>memory</h3>
            <ul>{mem_array}</ul>
            <h3>storage</h3>
            <ul>{storage_array}</ul>
            <h3>logs</h3>
            <ul>{logs_array}</ul>
          </div>
        </div>
      );
    }
  };

  const executeBytecode = async () => {
    if (evm) {
      let code;
      let data;
      let value;

      if (props.data != "") {
        data = props.data;
        if (data.substring(0, 2) != "0x") {
          data = "0x" + data;
        }
      } else {
        data = "0x00";
      }

      if (props.value != null) {
        value = props.value;
      } else {
        value = 0;
      }

      if (props.bytecode != "") {
        code = props.bytecode;
        if (code.substring(0, 2) != "0x") {
          code = "0x" + code;
        }

        if (ethers.utils.isBytesLike(code)) {
          const result = await evm.execute(code, 0, 0);
          console.log(result);
          setResults(result);
        }
      }
    }
  };

  const result = useMemo(() => executeBytecode(), [props.bytecode]);

  return <>{renderResults()}</>;
}
