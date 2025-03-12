/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

const CustomComponent = ({ prop1: prop3 = "Hello" }) => {
  return (
    <div>
      <p>prop3: {prop3}</p>
    </div>
  );
};

export default CustomComponent;
