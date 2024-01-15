import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Image, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { find, isEmpty, map, remove } from "lodash";
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

const { EditableRow, EditableCell } = EditableTableRow;
const listchuyen = [
  {
    id: "e165873f-f701-4bfd-afdb-ee2ba34c3ea8",
    maChuyen: "GCTP",
    tenChuyen: "Chuyền gia công tạo phôi",
    tenXuong: "Gia công linh kiện",
  },
];

function ChiTietCauHinhKanBan({ history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [Tram, setTram] = useState(null);
  const [TenTram, setTenTram] = useState(null);
  const [Ngay, setNgay] = useState(getDateNow());
  const [ListThietBi, setListThietBi] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [SelectedKanBan, setSelectedKanBan] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListTram(Ngay);
      getListThietBi();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (tits_qtsx_Tram_Id, ngay) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Tram_Id,
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          setData(res.data.list_ChiTiets);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListTram = (ngay) => {
    const param = convertObjectToUrlParams({
      ngay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan?${param}`,
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
          const listtram = res.data.list_Trams;
          setListTram(listtram);
        } else {
          setListTram([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListThietBi = (tram) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ThietBi?page=-1`,
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
        } else {
          setListThietBi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleThietBi = (value, record) => {
    setData((prevData) => {
      return prevData.map((item) => {
        if (
          record.tits_qtsx_KanBanChiTietTram_Id ===
          item.tits_qtsx_KanBanChiTietTram_Id
        ) {
          return {
            ...item,
            tits_qtsx_ThietBi_Id: value && value,
          };
        }
        return item;
      });
    });
  };

  const onChangeThietBi = (value, item) => {
    if (value) {
      const newData = {
        list_ChiTiets: Data,
        tits_qtsx_ThietBi_Id: value,
        tits_qtsx_Tram_Id: Tram,
        ngay: Ngay,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_KanBan/thiet-bi`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      }).then((res) => {
        getListData(Tram, Ngay);
      });
    }
  };

  const renderThietBi = (record) => {
    if (record) {
      return (
        <div>
          <Select
            className="heading-select slt-search th-select-heading"
            data={ListThietBi}
            placeholder="Chọn thiết bị"
            optionsvalue={["id", "tenThietBi"]}
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="name"
            onSelect={(value) => handleThietBi(value, record)}
            onBlur={(value) =>
              onChangeThietBi(
                record.tits_qtsx_ThietBi_Id && record.tits_qtsx_ThietBi_Id,
                record
              )
            }
            value={record.tits_qtsx_ThietBi_Id && record.tits_qtsx_ThietBi_Id}
          />
        </div>
      );
    }
    return null;
  };

  const handleInputChange = (val, item) => {
    const ThuTu = val.target.value;
    if (isEmpty(ThuTu) || Number(ThuTu) <= 0) {
      setEditingRecord([...editingRecord, item]);
      item.message = "Thứ tự phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) =>
            d.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() !==
            item.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
        );
      setEditingRecord(newData);
    }
    const newData = [...Data];

    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_KanBanChiTietTram_Id.toLowerCase() ===
        item.tits_qtsx_KanBanChiTietTram_Id.toLowerCase()
      ) {
        ct.thuTuThietBi = ThuTu;
      }
    });
    setData(newData);
  };

  const onChangeThuTu = (val, item) => {
    const newData = {
      tits_qtsx_KanBanChiTietTram_Id: item.tits_qtsx_KanBanChiTietTram_Id,
      thuTuThietBi: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KanBan/thu-tu-thiet-bi/${item.tits_qtsx_KanBanChiTietTram_Id}`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      getListData(Tram, Ngay);
    });
  };

  const renderThuTu = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
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
          value={item.thuTuThietBi && item.thuTuThietBi}
          onChange={(val) => handleInputChange(val, item)}
          onBlur={(val) => onChangeThuTu(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maChiTiet,
            value: d.maChiTiet,
          };
        })
      ),
      onFilter: (value, record) => record.maChiTiet.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn hàng",
      dataIndex: "tenDonHang",
      key: "tenDonHang",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenDonHang,
            value: d.tenDonHang,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Chi tiết cụm",
      dataIndex: "tenCum",
      key: "tenCum",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenCum,
            value: d.tenCum,
          };
        })
      ),
      onFilter: (value, record) => record.tenCum.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng (Chi tiết)",
      dataIndex: "soLuongChiTiet",
      key: "soLuongChiTiet",
      align: "center",
      width: 80,
    },
    {
      title: "Bản vẽ",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 120,
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
      title: "Tên thiết bị",
      dataIndex: "tenThietBi",
      key: "tenThietBi",
      align: "left",
      width: 200,
    },
    {
      title: "Thứ tự",
      key: "thuTuThietBi",
      align: "center",
      width: 100,
      render: (record) => renderThuTu(record),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = map(renderHead, (col) => {
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

  const handleOnSelectTram = (value) => {
    setTram(value);
    const tram = ListTram.find((t) => t.tits_qtsx_Tram_Id === value);
    setTenTram(tram.tenTram);
    getListData(value, Ngay);
  };

  const handleChangeNgay = (dateString) => {
    setNgay(dateString);
    getListData(Tram, dateString);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRowKanBans: SelectedKanBan,
    onChange: (selectedRowKeys, selectedRowKanBans) => {
      const newSelectedKanBan = [...selectedRowKanBans];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedKanBan(newSelectedKanBan);
      setSelectedKeys(newSelectedKey);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Chi tiết cấu hình KanBan cho sản phẩm"
        description="Chi tiết cấu hình KanBan cho sản phẩm"
      />
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
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Ngày:</h5>
            <DatePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={moment(Ngay, "DD/MM/YYYY")}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1500, y: "53vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeys,
            getCheckboxProps: (record) => ({}),
          }}
        />
      </Card>
    </div>
  );
}

export default ChiTietCauHinhKanBan;
