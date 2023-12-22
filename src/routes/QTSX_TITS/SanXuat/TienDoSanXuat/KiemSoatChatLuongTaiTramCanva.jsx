import React, { useEffect, useRef, useState } from "react";
import useImage from "use-image";

import { Layer, Image, Stage, Group, Circle, Text } from "react-konva";
import map from "lodash/map";
import forEach from "lodash/forEach";
import isEmpty from "lodash/isEmpty";
import remove from "lodash/remove";

function KiemSoatChatLuongTaiTramCanva({
  item,
  imageUrl,
  hm,
  dataHangMucKiemTra,
  setDataHangMucKiemTra,
  hinhAnhHmId,
  itemAnh,
}) {
  const [image] = useImage(imageUrl);
  const stageRef = useRef(null);

  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // get the new image scale size
    if (item) {
      const width = item.width;
      const height = item.height;

      // get the list image canvas
      let canvasItems = document.getElementsByClassName("th-image-canvas");
      if (canvasItems.length > 0) {
        const canvasItem = canvasItems[0];

        let widthRatio = canvasItem.offsetWidth / width;
        let heightRatio = canvasItem.offsetHeight / height;

        let minRatio = Math.min(widthRatio, heightRatio);

        setImageWidth(width * minRatio);
        setImageHeight(height * minRatio);
        setScale((width * minRatio) / item.width);
      }
    }
  }, [item, stageRef]);

  const onClickInImage = (evt, item, hmId) => {
    const hinhAnhId = item.sanPham_KhuVuc_HinhAnh_Id;
    // call api evt.target.getStage().getPointerPosition()
    const state = evt.target.getStage();
    const position = state.getPointerPosition();
    let newDataHangMucKiemTra = [...dataHangMucKiemTra];
    map(newDataHangMucKiemTra, (hm) => {
      if (hm.id === hmId && !hm.isThongSo) {
        map(hm.lst_HinhAnhs, (ha) => {
          if (ha.sanPham_KhuVuc_HinhAnh_Id === hinhAnhId) {
            ha.lst_Lois.push({
              id: null,
              stt: ha.lst_Lois.length + 1,
              subId: item.sanPham_KhuVuc_HinhAnh_Id + ha.lst_Lois.length + 1,
              hangMucKiemTra_Id: item.hangMucKiemTra_Id,
              hangMucKiemTra_ChiTiet_Id: item.hangMucKiemTra_ChiTiet_Id,
              sanPham_KhuVuc_HinhAnh_Id: item.sanPham_KhuVuc_HinhAnh_Id,
              toaDo_X: position.x / scale,
              toaDo_Y: position.y / scale,
              loaiLoi_Id: undefined,
              maLoaiLoi: "",
              isSuaLoi: false,
              isXacNhan: false,
              isRemoved: false,
            });
          }
          return ha;
        });
      }
      return hm;
    });
    setDataHangMucKiemTra(newDataHangMucKiemTra);
  };

  const onDoubleClick = (evt, item) => {
    deletePosition(item);
  };

  const renderCircleGroup = (item) => {
    const color =
      item.isSuaLoi && item.isXacNhan
        ? "#00B050"
        : item.isSuaLoi && !item.isXacNhan
        ? "#2F5597"
        : "#FF0000";
    const action = item.isSuaLoi
      ? ""
      : { onDblClick: (e) => onDoubleClick(e, item) };
    const x = item.toaDo_X * scale;
    const y = item.toaDo_Y * scale;
    return (
      <Group {...action}>
        <Circle x={x} y={y} radius={25 * scale} fill={color}></Circle>
        <Text
          fill="#FFFFFF"
          fontSize={15 * scale}
          text={item.maLoaiLoi}
          x={item.maLoaiLoi.length === 4 ? x - 20 * scale : x - 25 * scale}
          y={y - 7 * scale}
        />
      </Group>
    );
  };

  const deletePosition = async (item) => {
    let newDataHangMucKiemTra = [...dataHangMucKiemTra];
    map(newDataHangMucKiemTra, (hm) => {
      if (hm.id === item.hangMucKiemTra_Id) {
        // nhap lst_Lois co cung hangMucKiemTra_ChiTiet_Id vao 1 danh sach
        // dua vao item.hangMucKiemTra_ChiTiet_Id
        let lst_LoisBy_hangMucKiemTra_ChiTiet_Id = [];
        forEach(hm.lst_HinhAnhs, (ha) => {
          if (ha.hangMucKiemTra_ChiTiet_Id === item.hangMucKiemTra_ChiTiet_Id) {
            lst_LoisBy_hangMucKiemTra_ChiTiet_Id = [
              ...lst_LoisBy_hangMucKiemTra_ChiTiet_Id,
              ...ha.lst_Lois,
            ];
          }
        });
        map(hm.lst_HinhAnhs, (ha) => {
          if (ha.sanPham_KhuVuc_HinhAnh_Id === item.sanPham_KhuVuc_HinhAnh_Id) {
            // check if item.id === null slice to remove
            if (item.id === null) {
              remove(ha.lst_Lois, (loi) => {
                return loi.stt === item.stt;
              });
              remove(lst_LoisBy_hangMucKiemTra_ChiTiet_Id, (loi) => {
                return loi.subId === item.subId;
              });
            } else {
              map(ha.lst_Lois, (loi) => {
                if (item.id === loi.id) {
                  loi.isRemoved = true;
                }
                return loi;
              });
              map(lst_LoisBy_hangMucKiemTra_ChiTiet_Id, (loi) => {
                if (item.id === loi.id) {
                  loi.isRemoved = true;
                }
                return loi;
              });
            }
            // find item ha.lst_Lois if not exists item.isRemoved is true
            const allNotRemoved = lst_LoisBy_hangMucKiemTra_ChiTiet_Id.every(
              (item) => item.isRemoved && item.id
            );
            if (
              isEmpty(lst_LoisBy_hangMucKiemTra_ChiTiet_Id) ||
              allNotRemoved
            ) {
              map(hm.lst_HangMucKiemTra_ChiTiets, (idct) => {
                if (ha.hangMucKiemTra_ChiTiet_Id === idct.id) {
                  idct.kq = true;
                }
                return idct;
              });
            }
          }
          return ha;
        });
      }
      return hm;
    });
    setDataHangMucKiemTra(newDataHangMucKiemTra);
  };

  return (
    <div ref={stageRef} className="th-image-canvas">
      <Stage width={imageWidth} height={window.innerHeight} ref={stageRef}>
        <Layer className="th-mouover">
          <Image
            onClick={(val) => onClickInImage(val, item, hm.id)}
            image={image}
            width={imageWidth}
            height={imageHeight}
          />
          {map(item.lst_Lois, (item) => {
            if (item.isRemoved) return;
            return renderCircleGroup(item, scale);
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default KiemSoatChatLuongTaiTramCanva;
