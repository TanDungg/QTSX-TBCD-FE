import { Modal as AntModal, Button, Col, Checkbox, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { EditableTableRow, Select, Table } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
import moment from "moment";
import dayjs from "dayjs";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { map } from "lodash";
import { SaveOutlined } from "@ant-design/icons";
const { EditableRow, EditableCell } = EditableTableRow;

function ModalThietLap({ openModalFS, openModal, saveThietLap, dataTL }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(true);
  const [dataThietLap, setDataThietLap] = useState([]);

  useEffect(() => {
    if (openModal) {
      if (dataTL) {
        setDataThietLap([dataTL]);
      }
    }
  }, [openModal]);
  const hanhdleChecked = (target, key) => {
    const newData = dataThietLap[0];
    newData[key] = target;
    setDataThietLap([newData]);
    setFieldTouch(false);
  };
  let colValues = [
    {
      title: "Chuyển",
      key: "chuyen",
      align: "center",
      children: [
        {
          title: "THCK(CMC)",
          key: "THCK(CMC)",
          align: "center",
          children: [
            {
              title: "Gia công",
              dataIndex: "giaCong",
              key: "giaCong",
              align: "center",
              width: 55,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) =>
                      hanhdleChecked(e.target.checked, "giaCong")
                    }
                  ></Checkbox>
                );
              },
            },
            {
              title: "ED",
              dataIndex: "ed",
              key: "ed",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "ed")}
                  ></Checkbox>
                );
              },
            },
            {
              title: "Xi mạ",
              key: "xiMa",
              dataIndex: "xiMa",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "xiMa")}
                  ></Checkbox>
                );
              },
            },
          ],
        },
        {
          title: "NMK",
          dataIndex: "nmk",
          key: "nmk",
          align: "center",
          width: 50,
          render: (val) => {
            return (
              <Checkbox
                checked={val}
                onChange={(e) => hanhdleChecked(e.target.checked, "nmk")}
              ></Checkbox>
            );
          },
        },
        {
          title: "Công ty SMRM & Cấu kiện nặng(TITS)",
          key: "Công ty SMRM & Cấu kiện nặng(TITS)",
          align: "center",
          children: [
            {
              title: "Kho",
              dataIndex: "kho",
              key: "kho",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "kho")}
                  ></Checkbox>
                );
              },
            },
            {
              title: "Xưởng GCCT",
              key: "xuongGCCT",
              align: "center",
              children: [
                {
                  title: "Lazer",
                  dataIndex: "lazer",
                  key: "lazer",
                  align: "center",
                  width: 50,
                  render: (val) => {
                    return (
                      <Checkbox
                        checked={val}
                        onChange={(e) =>
                          hanhdleChecked(e.target.checked, "lazer")
                        }
                      ></Checkbox>
                    );
                  },
                },
                {
                  title: "Lazer Dầm H",
                  dataIndex: "lazerDamH",
                  key: "lazerDamH",
                  align: "center",
                  width: 50,
                  render: (val) => {
                    return (
                      <Checkbox
                        checked={val}
                        onChange={(e) =>
                          hanhdleChecked(e.target.checked, "lazerDamH")
                        }
                      ></Checkbox>
                    );
                  },
                },
                {
                  title: "Cưa vòng",
                  key: "cuaVong",
                  dataIndex: "cuaVong",
                  align: "center",
                  width: 50,
                  render: (val) => {
                    return (
                      <Checkbox
                        checked={val}
                        onChange={(e) =>
                          hanhdleChecked(e.target.checked, "cuaVong")
                        }
                      ></Checkbox>
                    );
                  },
                },
                {
                  title: "Chấn/ Đột",
                  key: "chanDot",
                  dataIndex: "chanDot",
                  align: "center",
                  width: 50,
                  render: (val) => {
                    return (
                      <Checkbox
                        checked={val}
                        onChange={(e) =>
                          hanhdleChecked(e.target.checked, "chanDot")
                        }
                      ></Checkbox>
                    );
                  },
                },
                {
                  title: "Vát mép",
                  key: "vatMep",
                  dataIndex: "vatMep",
                  align: "center",
                  width: 50,
                  render: (val) => {
                    return (
                      <Checkbox
                        checked={val}
                        onChange={(e) =>
                          hanhdleChecked(e.target.checked, "vatMep")
                        }
                      ></Checkbox>
                    );
                  },
                },
                {
                  title: "Khoan lỗ",
                  key: "khoanLo",
                  dataIndex: "khoanLo",
                  align: "center",
                  width: 55,
                  render: (val) => {
                    return (
                      <Checkbox
                        checked={val}
                        onChange={(e) =>
                          hanhdleChecked(e.target.checked, "khoanLo")
                        }
                      ></Checkbox>
                    );
                  },
                },
              ],
            },
            {
              title: "XHLKR",
              key: "xhlkr",
              dataIndex: "xhlkr",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "xhlkr")}
                  ></Checkbox>
                );
              },
            },
            {
              title: "XHKX",
              key: "xhkx",
              dataIndex: "xhkx",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "xhkx")}
                  ></Checkbox>
                );
              },
            },
            {
              title: "Phun bi",
              key: "phunBi",
              dataIndex: "phunBi",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "phunBi")}
                  ></Checkbox>
                );
              },
            },
            {
              title: "Sơn",
              key: "son",
              dataIndex: "son",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "son")}
                  ></Checkbox>
                );
              },
            },
            {
              title: "X - LR",
              key: "xlr",
              dataIndex: "xlr",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) => hanhdleChecked(e.target.checked, "xlr")}
                  ></Checkbox>
                );
              },
            },
            {
              title: "Kiểm định",
              key: "kiemDinh",
              dataIndex: "kiemDinh",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) =>
                      hanhdleChecked(e.target.checked, "kiemDinh")
                    }
                  ></Checkbox>
                );
              },
            },
            {
              title: "Đóng kiện",
              key: "dongKien",
              dataIndex: "dongKien",
              align: "center",
              width: 50,
              render: (val) => {
                return (
                  <Checkbox
                    checked={val}
                    onChange={(e) =>
                      hanhdleChecked(e.target.checked, "dongKien")
                    }
                  ></Checkbox>
                );
              },
            },
          ],
        },
      ],
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
  const handleCancel = () => {
    openModalFS(false);
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = () => {
    saveThietLap(dataThietLap[0]);
    openModalFS(false);
  };
  const title = "Thiết lập file dữ liệu mẫu BOM";

  return (
    <AntModal
      title={title}
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{ x: 1600, y: "60vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(dataThietLap)}
          size="small"
          pagination={false}
        />
      </div>
      <Row style={{ marginTop: 20 }}>
        <Col span={24} align="center">
          <Button
            style={{ marginBottom: 0 }}
            icon={<SaveOutlined />}
            type="primary"
            disabled={fieldTouch}
            onClick={onFinish}
          >
            Lưu thiết lập
          </Button>
        </Col>
      </Row>
    </AntModal>
  );
}

export default ModalThietLap;
