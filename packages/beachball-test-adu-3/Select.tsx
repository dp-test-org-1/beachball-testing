/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import CustomComponent from "@adu21/beachball-test-adu-2/CustomComponent";

const CustomSelect = ({ prop1: prop2 = "Hello" }) => {
  return (
    <div>
      <p>prop5: {prop2}</p>
      <CustomComponent prop1={prop2} />
    </div>
  );
};

export default CustomSelect;
