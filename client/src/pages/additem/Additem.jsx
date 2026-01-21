import "./addItem.scss";
import { useState } from "react";

const AddItem = () => {
  const [category, setCategory] = useState("");

  return (
    <div className="add-item">

      <div className="add-item__form">
        <h1 className="add-item__title">เพิ่มสินค้า</h1>
        <div className="form-group">
          <label htmlFor="itemName">ชื่อสินค้า</label>
          <input type="text" id="itemName" placeholder="ชื่อสินค้า" />
        </div>

        <div className="form-group">
          <label htmlFor="itemDetail">รายละเอียดสินค้า</label>
          <input type="text" id="itemDetail" placeholder="รายละเอียดสินค้า" />
        </div>

        <div className="form-group">
          <label htmlFor="price">ราคา</label>
          <input type="text" id="price" placeholder="ราคา" />
        </div>

        <div className="form-group">
          <label htmlFor="image">รูปภาพ</label>
          <input type="file" id="image" name="image" accept=".png,.jpg,.gif" />
        </div>

        <div className="form-group">
          <label htmlFor="model">ไฟล์โมเดล</label>
          <input type="file" id="model" name="model" accept=".glb,.gltf" />
        </div>

        <div className="category">
          <label htmlFor="category" className="category__title">
            หมวดหมู่
          </label>

          <select
            id="category"
            className="category__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled>
              เลือกหมวดหมู่
            </option>
            <option value="Vehicles">Vehicles</option>
            <option value="Electronics">Electronics</option>
            <option value="Characters">Characters</option>
            <option value="Furniture">Furniture</option>
            <option value="Sports">Sports</option>
            <option value="Food&Drink">Food & Drink</option>
          </select>
        </div>

        <input type="submit" value="Submit" className="add-item__submit" />
      </div>
    </div>
  );
};

export default AddItem;
