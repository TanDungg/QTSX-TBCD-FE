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
} from "antd";
import {
  CheckCircleOutlined,
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
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { BASE_URL_API } from "src/constants/Config";
import ModalKetThuc from "./ModalKetThuc";

const { EditableRow, EditableCell } = EditableTableRow;

function MaySanXuat({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [DataMaySanXuat, setDataMaySanXuat] = useState([]);
  const [DataKiemTra, setDataKiemTra] = useState([]);
  const [ListChuyen, setListChuyen] = useState([]);
  const [Chuyen, setChuyen] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListDonHang, setListDonHang] = useState([]);
  const [DonHang, setDonHang] = useState(null);
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
  const [editingRecord, setEditingRecord] = useState([]);
  const [DisabledKiemTra, setDisabledKiemTra] = useState(true);
  const listchuyen = [
    {
      id: "63aece3b-f542-4c09-bc51-49a39f831906",
      maChuyen: "HLKR",
      tenChuyen: "Chuyền Hàn linh kiện rời",
      tenXuong: "Gia công linh kiện",
    },
  ];

  useEffect(() => {
    if (permission && permission.view) {
      setListChuyen(listchuyen);
      setChuyen(listchuyen[0].id);
      getListSanPham(listchuyen[0].id, Ngay, keyTabs);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_DonHang_Id,
    tits_qtsx_Tram_Id,
    tits_qtsx_ThietBi_Id,
    ngay,
    keytabs
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_DonHang_Id,
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

            const newKetThuc = newData.filter(
              (kanban) => kanban.isBatDau === true
            );

            setSelectedKetThuc(newKetThuc);
            setDataMaySanXuat(newData);
          }
          if (keytabs === "2") {
            const newData = res.data.map((data) => {
              return {
                ...data,
                soLuongKiemTra: data.soLuongDaSanXuat,
                soLuongDat: data.soLuongDaSanXuat,
                isDatNgoaiQuan: data.isDatNgoaiQuan
                  ? data.isDatNgoaiQuan === true
                    ? "true"
                    : "false"
                  : null,
                isDatThongSoKyThuat: data.isDatThongSoKyThuat
                  ? data.isDatThongSoKyThuat === true
                    ? "true"
                    : "false"
                  : null,
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

  const getListSanPham = (tits_qtsx_Chuyen_Id, ngay, keytabs) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
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
          setListSanPham(res.data);
          setSanPham(res.data[0].tits_qtsx_SanPham_Id);
          getListDonHang(
            tits_qtsx_Chuyen_Id,
            res.data[0].tits_qtsx_SanPham_Id,
            ngay,
            keytabs
          );
        } else {
          setListSanPham([]);
          setSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonHang = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    ngay,
    keytabs
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
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
          setListDonHang(res.data);
          setDonHang(res.data[0].tits_qtsx_DonHang_Id);
          getListTram(
            tits_qtsx_Chuyen_Id,
            tits_qtsx_SanPham_Id,
            res.data[0].tits_qtsx_DonHang_Id,
            ngay,
            keytabs
          );
        } else {
          setListDonHang([]);
          setDonHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListTram = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_DonHang_Id,
    ngay,
    keytabs
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_DonHang_Id,
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
          setListTram(res.data);
          setTram(res.data[0].tits_qtsx_Tram_Id);
          getListThietBi(
            tits_qtsx_Chuyen_Id,
            tits_qtsx_SanPham_Id,
            tits_qtsx_DonHang_Id,
            res.data[0].tits_qtsx_Tram_Id,
            ngay,
            keytabs
          );
        } else {
          setListTram([]);
          setTram(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListThietBi = (
    tits_qtsx_Chuyen_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_DonHang_Id,
    tits_qtsx_Tram_Id,
    ngay,
    keytabs
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Chuyen_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_DonHang_Id,
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
          setListThietBi(res.data);
          setThietBi(res.data[0].tits_qtsx_ThietBi_Id);
          if (res.data[0].tits_qtsx_ThietBi_Id) {
            getListData(
              tits_qtsx_Chuyen_Id,
              tits_qtsx_SanPham_Id,
              tits_qtsx_DonHang_Id,
              tits_qtsx_Tram_Id,
              res.data[0].tits_qtsx_ThietBi_Id,
              ngay,
              keytabs
            );
          } else {
            setDataMaySanXuat([]);
          }
        } else {
          setListThietBi([]);
          setThietBi(null);
        }
      })
      .catch((error) => console.error(error));
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
        ,
        {
          title: "Rộng",
          dataIndex: "rong",
          key: "rong",
          align: "center",
          width: 70,
        },
        ,
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
      dataIndex: "soLuongDaSanXuat",
      key: "soLuongDaSanXuat",
      align: "center",
      width: 70,
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
      record.message = "Số lượng nhận phải là số lớn hơn 0 và bắt buộc";
    } else if (
      Number(ThongTinSoLuong) > record.soLuong &&
      key === "soLuongKiemTra"
    ) {
      setDisabledKiemTra(true);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      record.message = "Số lượng kiểm tra không được lớn hơn số lượng nhận";
    } else if (
      (Number(ThongTinSoLuong) + Number(record.soLuongLoi) > record.soLuong &&
        key === "soLuongDat") ||
      (Number(ThongTinSoLuong) + Number(record.soLuongDat) > record.soLuong &&
        key === "soLuongLoi")
    ) {
      setDisabledKiemTra(true);
      record.editingKey = editingKey;
      setEditingRecord([...editingRecord, record]);
      record.message =
        "Tổng số lượng nhập và số lượng lỗi không được lớn hơn số lượng nhận";
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_ChiTiet_Id.toLowerCase() !==
          record.tits_qtsx_ChiTiet_Id.toLowerCase()
      );
      setEditingRecord(newData);
      setDisabledKiemTra(false);
    }
    const newData = [...DataKiemTra];
    newData.forEach((datakiemtra, index) => {
      if (
        datakiemtra.tits_qtsx_ChiTiet_Id.toLowerCase() ===
        record.tits_qtsx_ChiTiet_Id.toLowerCase()
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
        ct.tits_qtsx_ChiTiet_Id.toLowerCase() ===
          record.tits_qtsx_ChiTiet_Id.toLowerCase() &&
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
          disabled={
            record.soLuongDaSanXuat === record.soLuongKiemTra &&
            Number(record.soLuongLoi) === 0
          }
          onChange={(val) => handleThongTinSoLuong(val, record, key)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const handleThongTinDatTinh = (value, record, key) => {
    setDataKiemTra((prevDataKiemTra) => {
      return prevDataKiemTra.map((item) => {
        if (
          record.tits_qtsx_ChiTiet_Id.toLowerCase() ===
          item.tits_qtsx_ChiTiet_Id.toLowerCase()
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
        disabled={
          record.soLuongDaSanXuat === record.soLuongKiemTra &&
          Number(record.soLuongLoi) === 0
        }
      />
    );
  };

  const handleMoTa = (val, record, key) => {
    const newData = [...DataKiemTra];
    newData.forEach((datakiemtra, index) => {
      if (
        datakiemtra.tits_qtsx_ChiTiet_Id.toLowerCase() ===
        record.tits_qtsx_ChiTiet_Id.toLowerCase()
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
          record.soLuongDaSanXuat === record.soLuongKiemTra &&
          Number(record.soLuongLoi) === 0
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
      align: "center",
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
      width: 120,
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
      align: "center",
      width: 100,
      render: (record) => renderThongTinSoLuong(record, "soLuongKiemTra"),
    },
    {
      title: "Đặt tính kiểm tra",
      children: [
        {
          title: "Ngoại quan",
          key: "isDatNgoaiQuan",
          align: "center",
          width: 150,
          render: (record) => renderThongTinDatTinh(record, "isDatNgoaiQuan"),
        },
        {
          title: "TS kỹ thuật",
          key: "isDatThongSoKyThuat",
          align: "center",
          width: 150,
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
          align: "center",
          width: 100,
          render: (record) => renderThongTinSoLuong(record, "soLuongLoi"),
        },
        {
          title: "SL đạt",
          key: "soLuongDat",
          align: "center",
          width: 100,
          render: (record) => renderThongTinSoLuong(record, "soLuongDat"),
        },
      ],
    },
    {
      title: "Nội dung lỗi (Nếu có)",
      key: "noiDungLoi",
      align: "center",
      width: 150,
      render: (record) => renderThongTinLoi(record, "noiDungLoi"),
    },
    {
      title: "Ghi chú",
      key: "moTa",
      align: "center",
      width: 150,
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
    const newData = SelectedKanBan.map((kanban) => {
      return {
        tits_qtsx_KanBanChiTietTram_Id: kanban.tits_qtsx_KanBanChiTietTram_Id,
        tits_qtsx_KanBanChiTiet_Id: kanban.tits_qtsx_KanBanChiTiet_Id,
        tits_qtsx_KanBan_Id: kanban.tits_qtsx_KanBan_Id,
        tits_qtsx_ChiTiet_Id: kanban.tits_qtsx_ChiTiet_Id,
      };
    });
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
          getListData(Chuyen, SanPham, DonHang, Tram, ThietBi, Ngay, keyTabs);
          setSelectedKanBan([]);
          setSelectedKeys([]);
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
        getListData(Chuyen, SanPham, DonHang, Tram, ThietBi, Ngay, keyTabs);
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

  const handleOnSelectChuyen = (value) => {
    if (value !== Chuyen) {
      setChuyen(value);
      setSanPham(null);
      setListSanPham([]);
      getListSanPham(value, Ngay, keyTabs);
      setDonHang(null);
      setListDonHang([]);
      setThietBi(null);
      setListThietBi([]);
    }
  };

  const handleOnSelectSanPham = (value) => {
    if (value !== SanPham) {
      setSanPham(value);
      setDonHang(null);
      setListDonHang([]);
      getListDonHang(Chuyen, value, Ngay);
      setTram(null);
      setListTram([]);
      setThietBi(null);
      setListThietBi([]);
    }
  };

  const handleOnSelectDonHang = (value) => {
    if (value !== DonHang) {
      setDonHang(value);
      setTram(null);
      setListTram([]);
      getListTram(Chuyen, SanPham, value, Ngay);
      setThietBi(null);
      setListThietBi([]);
    }
  };

  const handleOnSelectTram = (value) => {
    if (value !== Tram) {
      setTram(value);
      setThietBi(null);
      setListThietBi([]);
      getListThietBi(Chuyen, SanPham, DonHang, value, Ngay);
    }
  };

  const handleOnSelectThietBi = (value) => {
    if (value !== ThietBi) {
      setThietBi(value);
      getListData(Chuyen, SanPham, DonHang, Tram, value, Ngay, keyTabs);
    }
  };

  const handleChangeTabs = (key) => {
    setKeyTabs(key);
    getListSanPham(listchuyen[0].id, Ngay, key);
  };

  const handleChangeNgay = (dateString) => {
    setNgay(dateString);
    getListData(Chuyen, SanPham, DonHang, Tram, ThietBi, dateString, keyTabs);
  };

  const handleRefesh = () => {
    getListData(Chuyen, SanPham, DonHang, Tram, ThietBi, Ngay, keyTabs);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRowKanBans: SelectedKanBan,
    onChange: (selectedRowKeys, selectedRowKanBans) => {
      const newSelectedKanBan = [...selectedRowKanBans];
      const newSelectedKey = [...selectedRowKeys];

      const newBatDau = newSelectedKanBan.filter(
        (kanban) =>
          kanban.isBatDau === true || kanban.tinhTrang === "Hoàn thành"
      );
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
                          <h5>Chuyền:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListChuyen ? ListChuyen : []}
                            placeholder="Chọn chuyền"
                            optionsvalue={["id", "tenChuyen"]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectChuyen}
                            value={Chuyen}
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
                          <h5>Sản phẩm:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListSanPham ? ListSanPham : []}
                            placeholder="Chọn sản phẩm"
                            optionsvalue={[
                              "tits_qtsx_SanPham_Id",
                              "tenSanPham",
                            ]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectSanPham}
                            value={SanPham}
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
                          <h5>Đơn hàng:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListDonHang ? ListDonHang : []}
                            placeholder="Chọn đơn hàng"
                            optionsvalue={[
                              "tits_qtsx_DonHang_Id",
                              "tenDonHang",
                            ]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectDonHang}
                            value={DonHang}
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
                      scroll={{ x: 1500, y: "55vh" }}
                      columns={columns}
                      components={components}
                      className="gx-table-responsive"
                      dataSource={reDataForTable(DataMaySanXuat)}
                      size="small"
                      rowClassName={"editable-row"}
                      pagination={false}
                      loading={loading}
                      rowSelection={{
                        type: "checkbox",
                        ...rowSelection,
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
                          <h5>Chuyền:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListChuyen ? ListChuyen : []}
                            placeholder="Chọn chuyền"
                            optionsvalue={["id", "tenChuyen"]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectChuyen}
                            value={Chuyen}
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
                          <h5>Sản phẩm:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListSanPham ? ListSanPham : []}
                            placeholder="Chọn sản phẩm"
                            optionsvalue={[
                              "tits_qtsx_SanPham_Id",
                              "tenSanPham",
                            ]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectSanPham}
                            value={SanPham}
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
                          <h5>Đơn hàng:</h5>
                          <Select
                            className="heading-select slt-search th-select-heading"
                            data={ListDonHang ? ListDonHang : []}
                            placeholder="Chọn đơn hàng"
                            optionsvalue={[
                              "tits_qtsx_DonHang_Id",
                              "tenDonHang",
                            ]}
                            style={{ width: "100%" }}
                            showSearch
                            optionFilterProp="name"
                            onSelect={handleOnSelectDonHang}
                            value={DonHang}
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
                      scroll={{ x: 1500, y: "55vh" }}
                      columns={columnkiemtras}
                      components={components}
                      className="gx-table-responsive"
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
      <ModalKetThuc
        openModal={ActiveModalKetThuc}
        openModalFS={setActiveModalKetThuc}
        itemData={SelectedKetThuc.map((ketthuc) => {
          return {
            ...ketthuc,
            tits_qtsx_Tram_Id: Tram,
            tits_qtsx_ThietBi_Id: ThietBi,
          };
        })}
        refesh={handleRefesh}
      />
    </div>
  );
}

export default MaySanXuat;