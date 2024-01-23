import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Tabs,
  Image,
  Checkbox,
  Tag,
  Input,
  Modal as AntModal,
} from "antd";
import {
  CheckCircleOutlined,
  LogoutOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty, map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { BASE_URL_API } from "src/constants/Config";
import Helpers from "src/helpers";

const { EditableRow, EditableCell } = EditableTableRow;

function MaySanXuat({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [DataMaySanXuat, setDataMaySanXuat] = useState([]);
  const [DataKiemTra, setDataKiemTra] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [Tram, setTram] = useState(null);
  const [ListThietBi, setListThietBi] = useState([]);
  const [ThietBi, setThietBi] = useState(null);
  const [Ngay, setNgay] = useState(getDateNow());
  const [SelectedBatDau, setSelectedBatDau] = useState([]);
  const [SelectedKetThuc, setSelectedKetThuc] = useState([]);
  const [SelectedKanBan, setSelectedKanBan] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [keyTabs, setKeyTabs] = useState("1");
  const [ActiveModalKetThuc, setActiveModalKetThuc] = useState(false);
  const [DisabledKiemTra, setDisabledKiemTra] = useState(true);
  const [DisabledXacNhan, setDisabledXacNhan] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListTram(Ngay, keyTabs);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    tits_qtsx_Tram_Id,
    tits_qtsx_ThietBi_Id,
    ngay,
    keytabs
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Tram_Id,
      tits_qtsx_ThietBi_Id,
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          keytabs === "1"
            ? `tits_qtsx_KanBan/may-san-xuat?${param}`
            : `tits_qtsx_KanBan/kiem-tra-chat-luong?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (keytabs === "1") {
            const newData = res.data.map((data) => {
              return {
                ...data,
                ...data.quyCach,
              };
            });

            const newKetThuc = newData
              .filter((kanban) => kanban.isBatDau === true)
              .map((kt) => {
                return {
                  ...kt,
                  soLuong: 0,
                };
              });

            setSelectedKetThuc(newKetThuc);
            setDataMaySanXuat(newData);
          }
          if (keytabs === "2") {
            const newData = res.data.map((data) => {
              return {
                ...data,
                isDatNgoaiQuan: data.isDatNgoaiQuan ? "true" : "false",
                isDatThongSoKyThuat: data.isDatThongSoKyThuat
                  ? "true"
                  : "false",
              };
            });
            setDataKiemTra(newData);
          }
        } else {
          setDataMaySanXuat([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListTram = (ngay, keytabs) => {
    const param = convertObjectToUrlParams({
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          keytabs === "1"
            ? `tits_qtsx_KanBan/may-san-xuat?${param}`
            : `tits_qtsx_KanBan/kiem-tra-chat-luong?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListTram(res.data.list_Trams);
        } else {
          setListTram([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListThietBi = (tits_qtsx_Tram_Id, ngay, keytabs) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Tram_Id,
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          keytabs === "1"
            ? `tits_qtsx_KanBan/may-san-xuat?${param}`
            : `tits_qtsx_KanBan/kiem-tra-chat-luong?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListThietBi(res.data.list_ThietBis);
        } else {
          setListThietBi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleInputChange = (val, item) => {
    const slSanXuat = val.target.value;
    if (isEmpty(slSanXuat) || Number(slSanXuat) < 0) {
      setDisabledXacNhan(true);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng sản xuất phải lớn hơn hoặc bằng 0 và bắt buộc";
    } else if (Number(slSanXuat) > Number(item.soLuongChuaSanXuat)) {
      setDisabledXacNhan(true);
      setEditingRecord([...editingRecord, item]);
      item.message =
        "Số lượng sản xuất không được lớn hơn số lượng chưa sản xuất";
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() !==
          item.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
      );
      setEditingRecord(newData);
      newData.length === 0 && setDisabledXacNhan(false);
    }
    const newData = [...SelectedKetThuc];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() ===
        item.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
      ) {
        ct.soLuong = slSanXuat;
      }
    });
    setSelectedKetThuc(newData);
  };

  const renderSoLuongSanXuat = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() ===
        item.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
      ) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
            borderColor: isEditing ? "red" : "",
          }}
          className={`input-item`}
          type="number"
          value={ActiveModalKetThuc ? item.soLuong : item.soLuongDaSanXuat}
          onChange={(val) => handleInputChange(val, item)}
          disabled={!ActiveModalKetThuc}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let renderColumnSanXuat = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Bắt đầu",
      dataIndex: "isBatDau",
      key: "isBatDau",
      align: "center",
      width: 70,
      render: (value) => {
        return <Checkbox checked={value} disabled={true} />;
      },
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
      filters: removeDuplicates(
        map(DataMaySanXuat, (d) => {
          return {
            text: d.tenChiTiet,
            value: d.tenChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.tenChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Vật liệu",
      dataIndex: "vatLieu",
      key: "vatLieu",
      align: "center",
      filters: removeDuplicates(
        map(DataMaySanXuat, (d) => {
          return {
            text: d.vatLieu,
            value: d.vatLieu,
          };
        })
      ),
      onFilter: (value, record) => record.vatLieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng (Chi tiết)",
      dataIndex: "soLuongChiTiet",
      key: "soLuongChiTiet",
      align: "center",
      width: 70,
    },
    {
      title: "Quy cách chi tiết (mm)",
      align: "center",
      children: [
        {
          title: "Dài",
          dataIndex: "dai",
          key: "dai",
          align: "center",
          width: 70,
        },
        {
          title: "Rộng",
          dataIndex: "rong",
          key: "rong",
          align: "center",
          width: 70,
        },
        {
          title: "Dày",
          dataIndex: "day",
          key: "day",
          align: "center",
          width: 70,
        },
        {
          title: "Dn",
          dataIndex: "dn",
          key: "dn",
          align: "center",
          width: 70,
        },
        {
          title: "Dt",
          dataIndex: "dt",
          key: "dt",
          align: "center",
          width: 70,
        },
      ],
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "thoiGianBatDau",
      key: "thoiGianBatDau",
      align: "center",
      render: (value) => {
        return (
          <span
            style={{
              color: "#0469B9",
              fontSize: "13px",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
      render: (value) => {
        return (
          <span
            style={{
              color: "red",
              fontSize: "13px",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "Tổng TGGC (Phút)",
      dataIndex: "tongThoiGianGiaCong",
      key: "tongThoiGianGiaCong",
      align: "center",
      width: 70,
    },
    {
      title: "SL chưa sản xuất",
      dataIndex: "soLuongChuaSanXuat",
      key: "soLuongChuaSanXuat",
      align: "center",
      width: 70,
    },
    {
      title: "SL đã sản xuất",
      key: ActiveModalKetThuc ? "soLuong" : "soLuongDaSanXuat",
      align: "center",
      width: 70,
      render: (record) => renderSoLuongSanXuat(record),
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 100,
      render: (value) => {
        return (
          <Tag
            color={value === "Chưa hoàn thành" ? "red" : "blue"}
            style={{
              fontSize: "13px",
              whiteSpace: "break-spaces",
              // wordBreak: "break-all",
            }}
          >
            {value}
          </Tag>
        );
      },
    },
    {
      title: "Bản vẽ",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh bản vẽ"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "SL lỗi khi KTCL",
      dataIndex: "soLuongLoi",
      key: "soLuongLoi",
      align: "center",
      width: 70,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(renderColumnSanXuat, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const handleThongTinSoLuong = (val, record, key) => {
    const ThongTinSoLuong = val.target.value;
    const editingKey = key;
    if (
      (isEmpty(ThongTinSoLuong) || Number(ThongTinSoLuong) <= 0) &&
      key === "soLuongKiemTra"
    ) {
      setDisabledKiemTra(true);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      Helpers.alertError("Số lượng nhận phải là số lớn hơn 0 và bắt buộc");
    } else if (
      Number(ThongTinSoLuong) > record.soLuongDaSanXuat &&
      key === "soLuongKiemTra"
    ) {
      setDisabledKiemTra(true);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      Helpers.alertError("Số lượng kiểm tra không được lớn hơn số lượng nhận");
    } else if (
      (Number(ThongTinSoLuong) + Number(record.soLuongLoi) >
        record.soLuongDaSanXuat &&
        key === "soLuongDat") ||
      (Number(ThongTinSoLuong) + Number(record.soLuongDat) >
        record.soLuongDaSanXuat &&
        key === "soLuongLoi")
    ) {
      setDisabledKiemTra(true);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      Helpers.alertError(
        "Tổng số lượng nhập và số lượng lỗi không được lớn hơn số lượng nhận"
      );
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() !==
          record.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
      );
      setEditingRecord(newData);
      setDisabledKiemTra(false);
    }
    const newData = [...DataKiemTra];
    newData.forEach((datakiemtra, index) => {
      if (
        datakiemtra.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() ===
        record.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
      ) {
        if (key === "soLuongKiemTra") {
          datakiemtra.editingKey = editingKey;
          datakiemtra.soLuongKiemTra = ThongTinSoLuong;
        }
        if (key === "soLuongDat") {
          datakiemtra.editingKey = editingKey;
          datakiemtra.soLuongDat = ThongTinSoLuong;
        }
        if (key === "soLuongLoi") {
          datakiemtra.editingKey = editingKey;
          datakiemtra.soLuongLoi = ThongTinSoLuong;
        }
      }
    });
    setDataKiemTra(newData);
  };

  const renderThongTinSoLuong = (record, key) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() ===
          record.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() &&
        key === ct.editingKey
      ) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={record[key]}
          onChange={(val) => handleThongTinSoLuong(val, record, key)}
          disabled={record.isHoanThanh}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const handleThongTinDatTinh = (value, record, key) => {
    setDataKiemTra((prevDataKiemTra) => {
      return prevDataKiemTra.map((item) => {
        if (
          record.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() ===
          item.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
        ) {
          if (key === "isDatNgoaiQuan") {
            return {
              ...item,
              isDatNgoaiQuan: value,
            };
          } else if (key === "isDatThongSoKyThuat") {
            return {
              ...item,
              isDatThongSoKyThuat: value,
            };
          }
        }
        return item;
      });
    });
    setDisabledKiemTra(false);
  };

  const renderThongTinDatTinh = (record, key) => {
    return (
      <Select
        className="heading-select slt-search th-select-heading"
        data={[
          { isKey: "true", value: "Đạt" },
          { isKey: "false", value: "Không đạt" },
        ]}
        placeholder={"Chọn loại"}
        optionsvalue={["isKey", "value"]}
        style={{ width: "100%" }}
        value={record[key]}
        onSelect={(value) => handleThongTinDatTinh(value, record, key)}
        disabled={record.isHoanThanh}
      />
    );
  };

  const handleMoTa = (val, record, key) => {
    const newData = [...DataKiemTra];
    newData.forEach((datakiemtra, index) => {
      if (
        datakiemtra.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() ===
        record.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
      ) {
        if (key === "noiDungLoi") {
          datakiemtra.noiDungLoi = val.target.value;
        }
        if (key === "moTa") {
          datakiemtra.moTa = val.target.value;
        }
      }
    });
    setDataKiemTra(newData);
    setDisabledKiemTra(false);
  };

  const renderThongTinLoi = (record, key) => {
    return (
      <Input
        style={{
          textAlign: "center",
          width: "100%",
        }}
        className={`input-item`}
        value={record[key]}
        disabled={
          (Number(record.soLuongChiTiet) === Number(record.soLuongDaSanXuat) &&
            Number(record.soLuongDaSanXuat) === Number(record.soLuongKiemTra) &&
            Number(record.soLuongDat) === Number(record.soLuongKiemTra) &&
            Number(record.soLuongLoi) === 0 &&
            record.isDatNgoaiQuan === "true" &&
            record.isDatThongSoKyThuat === "true" &&
            key === "noiDungLoi") ||
          record.isHoanThanh
        }
        onChange={(val) => handleMoTa(val, record, key)}
      />
    );
  };

  let renderColumnKiemTra = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(DataKiemTra, (d) => {
          return {
            text: d.tenChiTiet,
            value: d.tenChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.tenChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "left",
      width: 150,
    },
    {
      title: "Đơn hàng",
      dataIndex: "tenDonHang",
      key: "tenDonHang",
      align: "left",
      width: 150,
    },
    {
      title: "Lô SX",
      dataIndex: "loSanXuat",
      key: "loSanXuat",
      align: "center",
      width: 70,
    },
    {
      title: "Ngày kiểm tra",
      dataIndex: "ngayKiemTra",
      key: "ngayKiemTra",
      align: "center",
      width: 100,
      render: (value) => {
        return (
          <span
            style={{
              color: "#0469B9",
              fontSize: "13px",
            }}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: "SL chi tiết gia công",
      dataIndex: "soLuongChiTiet",
      key: "soLuongChiTiet",
      align: "center",
      width: 70,
    },
    {
      title: "SL đã sản xuất",
      dataIndex: "soLuongDaSanXuat",
      key: "soLuongDaSanXuat",
      align: "center",
      width: 70,
    },
    {
      title: "SL kiểm tra",
      key: "soLuongKiemTra",
      align: "left",
      width: 80,
      render: (record) => renderThongTinSoLuong(record, "soLuongKiemTra"),
    },
    {
      title: "Đặt tính kiểm tra",
      children: [
        {
          title: "Ngoại quan",
          key: "isDatNgoaiQuan",
          align: "left",
          width: 100,
          render: (record) => renderThongTinDatTinh(record, "isDatNgoaiQuan"),
        },
        {
          title: "TS kỹ thuật",
          key: "isDatThongSoKyThuat",
          align: "left",
          width: 100,
          render: (record) =>
            renderThongTinDatTinh(record, "isDatThongSoKyThuat"),
        },
      ],
    },
    {
      title: "Kết quả kiểm tra",
      children: [
        {
          title: "SL lỗi",
          key: "soLuongLoi",
          align: "left",
          width: 80,
          render: (record) => renderThongTinSoLuong(record, "soLuongLoi"),
        },
        {
          title: "SL đạt",
          key: "soLuongDat",
          align: "left",
          width: 80,
          render: (record) => renderThongTinSoLuong(record, "soLuongDat"),
        },
      ],
    },
    {
      title: "Nội dung lỗi (Nếu có)",
      key: "noiDungLoi",
      align: "left",
      width: 120,
      render: (record) => renderThongTinLoi(record, "noiDungLoi"),
    },
    {
      title: "Ghi chú",
      key: "moTa",
      align: "left",
      width: 120,
      render: (record) => renderThongTinLoi(record, "moTa"),
    },
  ];

  const columnkiemtras = map(renderColumnKiemTra, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const handleBatDau = () => {
    const newData = {
      ngay: Ngay,
      tits_qtsx_Tram_Id: Tram,
      tits_qtsx_ThietBi_Id: ThietBi,
      list_ChiTiets: SelectedKanBan,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan/may-san-xuat-bat-dau`,
          "POST",
          newData,
          "BATDAU",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(Tram, ThietBi, Ngay, keyTabs);
          setSelectedKanBan([]);
          setSelectedKeys([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleKetThuc = () => {
    const newData = {
      ngay: Ngay,
      tits_qtsx_Tram_Id: Tram,
      tits_qtsx_ThietBi_Id: ThietBi,
      list_ChiTiets: SelectedKetThuc,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan/may-san-xuat-ket-thuc`,
          "POST",
          newData,
          "KETTHUC",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setActiveModalKetThuc(false);
          getListData(Tram, ThietBi, Ngay, keyTabs);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleKiemTra = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan/kiem-tra-chat-luong`,
          "PUT",
          DataKiemTra,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        getListData(Tram, ThietBi, Ngay, keyTabs);
      })
      .catch((error) => console.error(error));
  };

  const addButtonRender = () => {
    return keyTabs === "1" ? (
      <>
        <Button
          icon={<PlayCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleBatDau}
          disabled={!SelectedKanBan.length || SelectedBatDau.length}
        >
          Bắt đầu
        </Button>
        <Button
          icon={<PauseCircleOutlined />}
          className="th-margin-bottom-0"
          type="danger"
          onClick={() => setActiveModalKetThuc(true)}
          disabled={!SelectedKetThuc.length}
        >
          Kết thúc
        </Button>
      </>
    ) : (
      <>
        <Button
          icon={<CheckCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleKiemTra}
          disabled={!DataKiemTra.length || DisabledKiemTra}
        >
          Xác nhận
        </Button>
      </>
    );
  };

  const handleOnSelectTram = (value) => {
    if (value !== Tram) {
      setTram(value);
      setThietBi(null);
      setListThietBi([]);
      setDataMaySanXuat([]);
      setDataKiemTra([]);
      getListThietBi(value, Ngay, keyTabs);
    }
  };

  const handleOnSelectThietBi = (value) => {
    if (value !== ThietBi) {
      setThietBi(value);
      setDataMaySanXuat([]);
      setDataKiemTra([]);
      getListData(Tram, value, Ngay, keyTabs);
    }
  };

  const handleChangeTabs = (key) => {
    setKeyTabs(key);
    setTram(null);
    setListTram([]);
    setThietBi(null);
    setListThietBi([]);
    setDataMaySanXuat([]);
    setDataKiemTra([]);
    getListTram(Ngay, key);
  };

  const handleChangeNgay = (dateString) => {
    if (Ngay !== dateString) {
      setNgay(dateString);
      getListTram(dateString, keyTabs);
      getListData(Tram, ThietBi, dateString, keyTabs);
    }
  };

  const rowSelection = {
    selectedRowKanBans: SelectedKanBan,
    selectedRowKeys: SelectedKeys,
    onChange: (selectedRowKeys, selectedRowKanBans) => {
      const newSelectedKanBan = [...selectedRowKanBans];
      const newSelectedKey = [...selectedRowKeys];

      const newBatDau = newSelectedKanBan.filter((kanban) => {
        return kanban.isBatDau === true || kanban.isHoanThanh === true;
      });
      setSelectedBatDau(newBatDau);

      if (!newBatDau.length) {
        setSelectedKanBan(newSelectedKanBan);
        setSelectedKeys(newSelectedKey);
      }
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Máy sản xuất"
        description="Máy sản xuất"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Tabs
          defaultActiveKey="1"
          type="card"
          onChange={(key) => handleChangeTabs(key)}
          size={"middle"}
          items={new Array(2).fill(null).map((_, i) => {
            const id = String(i + 1);
            return {
              label: id === "1" ? `Sản xuất` : `Kiểm tra chất lượng`,
              key: id,
              children:
                id === "1" ? (
                  <>
                    <Card className="th-card-margin-bottom th-card-reset-margin">
                      <Row>
                        <Col
                          xxl={6}
                          xl={8}
                          lg={12}
                          md={12}
                          sm={20}
                          xs={24}
                          style={{
                            marginBottom: 8,
                          }}
                        >
                          <h5>Trạm:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListTram ? ListTram : []}
                            placeholder="Chọn trạm"
                            optionsvalue={["tits_qtsx_Tram_Id", "tenTram"]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectTram}
                            value={Tram}
                          />
                        </Col>
                        <Col
                          xxl={6}
                          xl={8}
                          lg={12}
                          md={12}
                          sm={20}
                          xs={24}
                          style={{
                            marginBottom: 8,
                          }}
                        >
                          <h5>Thiết bị:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListThietBi ? ListThietBi : []}
                            placeholder="Chọn thiết bị"
                            optionsvalue={[
                              "tits_qtsx_ThietBi_Id",
                              "tenThietBi",
                            ]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectThietBi}
                            value={ThietBi}
                          />
                        </Col>
                        <Col
                          xxl={6}
                          xl={8}
                          lg={12}
                          md={12}
                          sm={24}
                          xs={24}
                          style={{ marginBottom: 8 }}
                        >
                          <h5>Ngày:</h5>
                          <DatePicker
                            format={"DD/MM/YYYY"}
                            onChange={(date, dateString) =>
                              handleChangeNgay(dateString)
                            }
                            defaultValue={moment(Ngay, "DD/MM/YYYY")}
                            allowClear={false}
                          />
                        </Col>
                      </Row>
                    </Card>
                    <Table
                      bordered
                      scroll={{ x: 1500, y: "45vh" }}
                      columns={columns}
                      components={components}
                      className="gx-table-responsive th-table"
                      dataSource={reDataForTable(DataMaySanXuat)}
                      size="small"
                      rowClassName={"editable-row"}
                      pagination={false}
                      loading={loading}
                      rowSelection={{
                        type: "checkbox",
                        ...rowSelection,
                        hideSelectAll: true,
                        preserveSelectedRowKeys: true,
                        selectedRowKeys: SelectedKeys,
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Card className="th-card-margin-bottom th-card-reset-margin">
                      <Row>
                        <Col
                          xxl={6}
                          xl={8}
                          lg={12}
                          md={12}
                          sm={20}
                          xs={24}
                          style={{
                            marginBottom: 8,
                          }}
                        >
                          <h5>Trạm:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListTram ? ListTram : []}
                            placeholder="Chọn trạm"
                            optionsvalue={["tits_qtsx_Tram_Id", "tenTram"]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectTram}
                            value={Tram}
                          />
                        </Col>
                        <Col
                          xxl={6}
                          xl={8}
                          lg={12}
                          md={12}
                          sm={20}
                          xs={24}
                          style={{
                            marginBottom: 8,
                          }}
                        >
                          <h5>Thiết bị:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListThietBi ? ListThietBi : []}
                            placeholder="Chọn thiết bị"
                            optionsvalue={[
                              "tits_qtsx_ThietBi_Id",
                              "tenThietBi",
                            ]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectThietBi}
                            value={ThietBi}
                          />
                        </Col>
                      </Row>
                    </Card>
                    <Table
                      bordered
                      scroll={{ x: 1500, y: "45vh" }}
                      columns={columnkiemtras}
                      components={components}
                      className="gx-table-responsive th-table"
                      dataSource={reDataForTable(DataKiemTra)}
                      size="small"
                      rowClassName={"editable-row"}
                      pagination={false}
                      loading={loading}
                    />
                  </>
                ),
            };
          })}
        />
      </Card>
      <AntModal
        title={"Chọn thiết bị cho chi tiết"}
        className="th-card-reset-margin"
        open={ActiveModalKetThuc}
        width={width > 1600 ? `90%` : "100%"}
        closable={true}
        onCancel={() => setActiveModalKetThuc(false)}
        footer={null}
      >
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1500, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(SelectedKetThuc)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button
            icon={<LogoutOutlined />}
            className="th-margin-bottom-0"
            type="default"
            onClick={() => setActiveModalKetThuc(false)}
          >
            Thoát
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            className="th-margin-bottom-0"
            type="primary"
            onClick={handleKetThuc}
            disabled={DisabledXacNhan}
          >
            Lưu
          </Button>
        </div>
      </AntModal>
    </div>
  );
}

export default MaySanXuat;
