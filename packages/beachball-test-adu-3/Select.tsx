/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import CustomComponent from "@adu21/beachball-test-adu-2/CustomComponent";

const var1 = "Hello";

const CustomSelect2 = ({ prop1 = "Hello" }) => {
  return (
    <div>
      <p>prop5: {prop1}</p>
      <CustomComponent prop1={prop1} />
    </div>
  );
};

export default CustomSelect2;
