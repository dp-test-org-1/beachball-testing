/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

const CustomComponent = ({ prop1: prop6 = "Hello" }) => {
  return (
    <div>
      <p>prop6: {prop6}</p>
    </div>
  );
};

export default CustomComponent;
