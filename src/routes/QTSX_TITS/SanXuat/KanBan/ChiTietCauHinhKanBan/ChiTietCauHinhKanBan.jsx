import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Image,
  Input,
  Modal as AntModal,
  Button,
} from "antd";
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
import { CheckCircleOutlined, LogoutOutlined } from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;

function ChiTietCauHinhKanBan({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);
  const [ListTram, setListTram] = useState([]);
  const [Tram, setTram] = useState(null);
  const [Ngay, setNgay] = useState(getDateNow());
  const [ListThietBi, setListThietBi] = useState([]);
  const [ThietBi, setThietBi] = useState(null);
  const [editingRecord, setEditingRecord] = useState([]);
  const [SelectedKanBan, setSelectedKanBan] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [ActiveModalChonThietBi, setActiveModalChonThietBi] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListTram(Ngay);
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
          setTram(listtram[0].tits_qtsx_Tram_Id);
          getListData(listtram[0].tits_qtsx_Tram_Id, ngay);
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
          `tits_qtsx_ThietBi?tits_qtsx_Tram_Id=${tram}&page=-1`,
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
          disabled={ActiveModalChonThietBi || !item.tits_qtsx_ThietBi_Id}
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

  const handleOnSelectThietBi = (value) => {
    setThietBi(value);
  };

  const onChangeThietBi = () => {
    const newData = {
      list_ChiTiets: SelectedKanBan,
      tits_qtsx_ThietBi_Id: ThietBi,
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
      if (res && res.status !== 409) {
        setActiveModalChonThietBi(false);
        getListData(Tram, Ngay);
        setSelectedKanBan([]);
        setSelectedKeys([]);
        setThietBi(null);
      }
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<CheckCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() => setActiveModalChonThietBi(true)}
          disabled={!SelectedKanBan.length || !Tram}
        >
          Chon thiết bị
        </Button>
      </>
    );
  };

  const handleOnSelectTram = (value) => {
    setTram(value);
    setListThietBi([]);
    setThietBi(null);
    setSelectedKanBan([]);
    setSelectedKeys([]);
    getListData(value, Ngay);
    getListThietBi(value);
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
        buttons={addButtonRender()}
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
      <AntModal
        title={"Chọn thiết bị cho chi tiết"}
        className="th-card-reset-margin"
        open={ActiveModalChonThietBi}
        width={width > 1200 ? `80%` : "100%"}
        closable={true}
        onCancel={() => setActiveModalChonThietBi(false)}
        footer={null}
      >
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          align={"center"}
        >
          <Col
            lg={12}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: "80px",
              }}
            >
              Thiết bị:
            </span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListThietBi ? ListThietBi : []}
              placeholder="Chọn thiết bị"
              optionsvalue={["id", "tenThietBi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectThietBi}
              value={ThietBi}
            />
          </Col>
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
              onClick={() => setActiveModalChonThietBi(false)}
            >
              Thoát
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={onChangeThietBi}
            >
              Lưu
            </Button>
          </div>
        </Card>
        <Table
          bordered
          scroll={{ x: 1000, y: "50vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(SelectedKanBan)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
        />
      </AntModal>
    </div>
  );
}

export default ChiTietCauHinhKanBan;
