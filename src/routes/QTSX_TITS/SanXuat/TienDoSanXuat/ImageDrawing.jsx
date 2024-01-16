import React, { useRef, useEffect, useState } from "react";
import ModalChamLoi from "./ModalChamLoi";
import ModalDaSuaChuaLai from "./ModalDaSuaChuaLai";

const ImageDrawing = ({
  imageUrl,
  hinhAnhId,
  AddLoi,
  dataNoiDung,
  listViTri,
  xoaToaDo,
  sanPhamhinhAnhId,
  SuaChuaLai,
  chamLoi,
}) => {
  const canvasRef = useRef(null);
  const [ViTri, setViTri] = useState();
  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalSuaChuaLai, setActiveModalSuaChuaLai] = useState(false);
  const [circlePosition, setCirclePosition] = useState({});
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
          const x = (toaDo.x * canvas.width) / 100;
          const y = (toaDo.y * canvas.height) / 100;
          context.beginPath();
          context.arc(x, y, 20, 0, 2 * Math.PI);
          context.fillStyle = toaDo.isHoanThanhSCL ? "#0E42FA" : "#FF0101";
          context.fill();
          // Thêm chữ vào hình tròn
          context.font = "14px Arial";
          context.fillStyle = "white";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(toaDo.maLoi, x, y);
        });
      }
      // Vẽ các hình tròn đã lưu
    };
  }, [imageUrl, listViTri, SuaChuaLai]);

  useEffect(() => {
    if (chamLoi) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      // Load hình ảnh
      const image = new Image();
      image.src = imageUrl; // Thay thế đường dẫn hình ảnh thực tế
      image.onload = () => {
        if (circlePosition.x) {
          setActiveModal(true);
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.arc(circlePosition.x, circlePosition.y, 20, 0, 2 * Math.PI);
        context.fillStyle = "#FF0101";
        context.fill();
      };
      // Vẽ các hình tròn đã lưu
    }
  }, [circlePosition]);

  const handleCanvasClick = (e) => {
    if (AddLoi !== undefined) {
      const canvas = canvasRef.current;
      const pos = getMousePos(canvas, e);
      // Lưu thông tin về hình tròn
      if (listViTri) {
        let check = false;
        listViTri.forEach((vt) => {
          const toaDo = JSON.parse(vt);
          const x = (toaDo.x * canvas.width) / 100;
          const y = (toaDo.y * canvas.height) / 100;

          const checkToaDo =
            Math.sqrt(
              (Number(pos.x) - Number(x)) ** 2 +
                (Number(pos.y) - Number(y)) ** 2
            ) <= 20;
          if (checkToaDo) {
            check = true;
            if (xoaToaDo) {
              xoaToaDo({
                viTri: vt,
                tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id:
                  toaDo.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id,
                tits_qtsx_HangMucKiemTra_HinhAnh_Id: hinhAnhId,
                tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id:
                  toaDo.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id,
              });
            } else if (SuaChuaLai && !toaDo.isHoanThanhSCL) {
              setActiveModalSuaChuaLai(true);
              setViTri({
                viTri: toaDo,
                tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id:
                  toaDo.tits_qtsx_TDSXKiemSoatChatLuongChiTiet_Id,
                tits_qtsx_HangMucKiemTra_HinhAnh_Id: hinhAnhId,
                tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id:
                  toaDo.tits_qtsx_TDSXKiemSoatChatLuongChiTietLoi_Id,
                tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id:
                  toaDo.tits_qtsx_TDSXKiemSoatChatLuongTieuDePhu_Id,
              });
            }
          }
        });
        if (!check && xoaToaDo) {
          setViTri({
            x: pos.x,
            y: pos.y,
            tits_qtsx_HangMucKiemTra_HinhAnh_Id: hinhAnhId,
            tits_qtsx_SanPhamHinhAnh_Id: sanPhamhinhAnhId,
          });
          // setCircles({ x: pos.x, y: pos.y });
          setActiveModal(true);
        }
      } else {
        setViTri({
          x: pos.x,
          y: pos.y,
          tits_qtsx_HangMucKiemTra_HinhAnh_Id: hinhAnhId,
          tits_qtsx_SanPhamHinhAnh_Id: sanPhamhinhAnhId,
        });
        setCirclePosition({ x: pos.x, y: pos.y });
      }
    }
  };

  const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  // const handleMouseUp = () => {
  //   setIsDrawing(false);
  // };
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
        style={{ cursor: "pointer" }}
        // onMouseUp={handleMouseUp}
      />
      <ModalChamLoi
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        ViTri={ViTri}
        ThemLoi={ThemLoi}
        ListNoiDung={dataNoiDung}
        setCirclePosition={setCirclePosition}
      />
      <ModalDaSuaChuaLai
        openModal={ActiveModalSuaChuaLai}
        openModalFS={setActiveModalSuaChuaLai}
        ViTri={ViTri}
        SuaChuaLai={(data) => SuaChuaLai(data)}
      />
    </>
  );
};

export default ImageDrawing;
