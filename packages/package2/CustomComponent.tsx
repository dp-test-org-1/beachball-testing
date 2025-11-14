/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

const CustomComponent = ({ prop1: prop4 = "Hello" }) => {
  return (
    <div>
      <p>prop6: {prop4}</p>
    </div>
  );
};

export default CustomComponent;
