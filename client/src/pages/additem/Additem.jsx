import "./addItem.scss";

const AddItem = () => {
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
          <p className="category__title">หมวดหมู่</p>

          <div className="category__option">
            <input type="radio" id="Vehicles" name="choice" value="Vehicles" />
            <label htmlFor="Vehicles">Vehicles</label>
          </div>

          <div className="category__option">
            <input type="radio" id="Electronics" name="choice" value="Electronics" />
            <label htmlFor="Electronics">Electronics</label>
          </div>

          <div className="category__option">
            <input type="radio" id="Characters" name="choice" value="Characters" />
            <label htmlFor="Characters">Characters</label>
          </div>

          <div className="category__option">
            <input type="radio" id="Furniture" name="choice" value="Furniture" />
            <label htmlFor="Furniture">Furniture</label>
          </div>

          <div className="category__option">
            <input type="radio" id="Sports" name="choice" value="Sports" />
            <label htmlFor="Sports">Sports</label>
          </div>

          <div className="category__option">
            <input type="radio" id="FoodDrink" name="choice" value="Food&Drink" />
            <label htmlFor="FoodDrink">Food & Drink</label>
          </div>
        </div>

        <input type="submit" value="Submit" className="add-item__submit" />
      </div>
    </div>
  );
};

export default AddItem;
