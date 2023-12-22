import React, { useRef, useEffect, useState } from "react";
import ModalChamLoi from "./ModalChamLoi";

const ImageDrawing = ({
  imageUrl,
  hinhAnhId,
  AddLoi,
  dataNoiDung,
  listViTri,
}) => {
  const canvasRef = useRef(null);
  const [circles, setCircles] = useState([]);
  const [ViTri, setViTri] = useState();

  const [ActiveModal, setActiveModal] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Load hình ảnh
    const image = new Image();
    image.src = imageUrl; // Thay thế đường dẫn hình ảnh thực tế

    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (listViTri && listViTri.length > 0) {
        listViTri.forEach((circle) => {
          const toaDo = JSON.parse(circle);
          context.beginPath();
          context.arc(toaDo.x, toaDo.y, 20, 0, 2 * Math.PI);
          context.fillStyle = "red";
          context.fill();
          // Thêm chữ vào hình tròn
          context.font = "14px Arial";
          context.fillStyle = "white";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(toaDo.maLoi, toaDo.x, toaDo.y);
        });
      }
      // Vẽ các hình tròn đã lưu
    };
  }, [listViTri]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const pos = getMousePos(canvas, e);
    // Lưu thông tin về hình tròn
    setViTri({ x: pos.x, y: pos.y, tits_qtsx_SanPhamHinhAnh_Id: hinhAnhId });
    setActiveModal(true);
    // setCircles([...circles, newCircle]);
  };

  const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  const ThemLoi = (data) => {
    AddLoi(data);
  };
  return (
    <>
      <canvas
        ref={canvasRef}
        width={600} // Thay thế kích thước bằng kích thước thực tế của hình ảnh
        height={300} // Thay thế kích thước bằng kích thước thực tế của hình ảnh
        onClick={handleCanvasClick}
      />
      <ModalChamLoi
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        ViTri={ViTri}
        ThemLoi={ThemLoi}
        ListNoiDung={dataNoiDung.list_TDSXKiemSoatChatLuongChiTiets}
      />
    </>
  );
};

export default ImageDrawing;
