import { DeleteOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Row,
  Button,
  Card,
  Checkbox,
  Switch,
} from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import { DEFAULT_FORM_CONGDOAN } from "src/constants/Config";
import { reDataForTable } from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalThongTinKiemSoat({
  openModalFS,
  openModal,
  DataThemThongTin,
  itemData,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListThongTin, setListThongTin] = useState([]);
  const [ThongTinKiemSoat, setThongTinKiemSoat] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListThongTin();
      setFieldsValue({
        themthongtin: {
          isXem: false,
          isNhap: false,
          isKiemSoatSoLo: false,
        },
      });
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListThongTin = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ThongTinKiemSoat?page=-1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        const newData = res.data.filter((data) => {
          return (
            itemData &&
            !itemData.some(
              (item) => item.tits_qtsx_ThongTinKiemSoat_Id === data.id
            )
          );
        });
        setListThongTin(newData);
      } else {
        setListThongTin([]);
      }
    });
  };

  const deleteItemFunc = (item, title) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenThongTinKiemSoat, title);
  };

  const deleteItemAction = (item) => {
    const newData = ThongTinKiemSoat.filter(
      (d) =>
        d.tits_qtsx_ThongTinKiemSoat_Id !== item.tits_qtsx_ThongTinKiemSoat_Id
    );
    setThongTinKiemSoat(newData);
  };

  const actionContent = (item) => {
    const deleteVal = {
      onClick: () => deleteItemFunc(item, "thông tin kiểm soát"),
    };

    return (
      <div>
        <a {...deleteVal} title="Xóa thông tin kiểm soát">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const handleCheckboxChange = (record, value) => {
    const newData = ThongTinKiemSoat.map((thongtin) => {
      if (
        thongtin.tits_qtsx_ThongTinKiemSoat_Id ===
        record.tits_qtsx_ThongTinKiemSoat_Id
      ) {
        return value === "isXem"
          ? {
              ...thongtin,
              isXem: thongtin.isXem === undefined ? true : !thongtin.isXem,
            }
          : value === "isNhap"
          ? {
              ...thongtin,
              isNhap: thongtin.isNhap === undefined ? true : !thongtin.isNhap,
            }
          : {
              ...thongtin,
              isKiemTraSoLo:
                thongtin.isKiemTraSoLo === undefined
                  ? true
                  : !thongtin.isKiemTraSoLo,
            };
      }
      return thongtin;
    });

    setThongTinKiemSoat(newData);
  };

  const renderSCL = (record, value) => {
    return (
      <Checkbox
        checked={
          value === "isXem"
            ? record.isXem
            : value === "isNhap"
            ? record.isNhap
            : record.isKiemTraSoLo
        }
        onChange={() => handleCheckboxChange(record, value)}
      />
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
      render: (value) => actionContent(value),
    },
    {
      title: "Thứ tự",
      dataIndex: "thuTu",
      key: "thuTu",
      align: "center",
      width: 120,
    },
    {
      title: "Thông tin kiểm soát",
      dataIndex: "tenThongTinKiemSoat",
      key: "tenThongTinKiemSoat",
      align: "center",
    },
    {
      title: "Xem",
      key: "isXem",
      align: "center",
      render: (record) => renderSCL(record, "isXem"),
    },
    {
      title: "Nhập",
      key: "isNhap",
      align: "center",
      render: (record) => renderSCL(record, "isNhap"),
    },
    {
      title: "Kiểm tra số lô",
      key: "isKiemTraSoLo",
      align: "center",
      render: (record) => renderSCL(record, "isKiemTraSoLo"),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
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

  const onFinish = (values) => {
    const data = values.themthongtin;
    const thongtin = ListThongTin.filter(
      (d) => d.id === data.tits_qtsx_ThongTinKiemSoat_Id
    );
    const newData = {
      ...data,
      tenThongTinKiemSoat: thongtin[0].tenThongTinKiemSoat,
      maThongTinKiemSoat: thongtin[0].maThongTinKiemSoat,
      thuTu: 1,
    };
    setThongTinKiemSoat([...ThongTinKiemSoat, newData]);

    const thongtinkiemsoat = ListThongTin.filter(
      (d) => d.id !== data.tits_qtsx_ThongTinKiemSoat_Id
    );
    setListThongTin(thongtinkiemsoat);
    resetFields();
  };

  const XacNhan = () => {
    DataThemThongTin(ThongTinKiemSoat);
    setThongTinKiemSoat([]);
    resetFields();
    openModalFS(false);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm thông tin kiểm soát"
      open={openModal}
      width={width > 1200 ? `70%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <div className="gx-main-content">
          <Form
            {...DEFAULT_FORM_CONGDOAN}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Thông tin"
              name={["themthongtin", "tits_qtsx_ThongTinKiemSoat_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListThongTin}
                placeholder="Chọn thông tin kiểm soát"
                optionsvalue={["id", "tenThongTinKiemSoat"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Xem"
              name={["themthongtin", "isXem"]}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>

            <FormItem
              label="Nhập"
              name={["themthongtin", "isNhap"]}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>

            <FormItem
              label="Kiểm tra số lô"
              name={["themthongtin", "isKiemTraSoLo"]}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm thông tin
              </Button>
            </Row>
          </Form>
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1000, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(ThongTinKiemSoat)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
            // loading={loading}
          />
          <Row justify={"center"} style={{ marginTop: 15 }}>
            <Button
              type="primary"
              onClick={XacNhan}
              disabled={!ThongTinKiemSoat.length}
            >
              Xác nhận
            </Button>
          </Row>
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalThongTinKiemSoat;
