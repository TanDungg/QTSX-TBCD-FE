import PropTypes from "prop-types";
import React from "react";
import { Row, Col, DatePicker } from "antd";
import { Select, Toolbar } from "src/components/Common";
const { RangePicker } = DatePicker;
export default function ThreeColSearch(props) {
  return (
    <Row>
      <Col
        xl={8}
        lg={12}
        md={12}
        sm={24}
        xs={24}
        style={{ marginBottom: 8 }}
        className={props.className[0]}
      >
        <h5>{props.title[0]}</h5>
        {props.RangePicker1 ? (
          <RangePicker {...props.RangePicker1} />
        ) : (
          <Select
            className="heading-select slt-search th-select-heading"
            style={{ width: "100%" }}
            {...props.select1}
          />
        )}
      </Col>
      <Col
        xl={8}
        lg={12}
        md={12}
        sm={24}
        xs={24}
        style={{ marginBottom: 8 }}
        className={props.className[1]}
      >
        <h5>{props.title[1]}</h5>
        {props.RangePicker2 ? (
          <RangePicker {...props.RangePicker2} />
        ) : (
          <Select
            className="heading-select slt-search th-select-heading"
            style={{ width: "100%" }}
            {...props.select2}
          />
        )}
      </Col>
      <Col xl={8} lg={24} md={24} xs={24} className={props.className[2]}>
        <h5 style={{ height: 16.797 }}> </h5>
        {props.RangePicker3 ? (
          <RangePicker {...props.RangePicker3} />
        ) : props.select3 ? (
          <Select
            className="heading-select slt-search th-select-heading"
            style={{ width: "100%" }}
            {...props.select3}
          />
        ) : (
          <Toolbar count={1} search={props.search} />
        )}
      </Col>
    </Row>
  );
}

ThreeColSearch.propTypes = {
  className: PropTypes.array,
  title: PropTypes.array,
  placeholder: PropTypes.array,
  select1: PropTypes.object,
  select2: PropTypes.array,
  select3: PropTypes.array,
  RangePicker1: PropTypes.array,
  RangePicker2: PropTypes.array,
  RangePicker3: PropTypes.array,
  DatePicker1: PropTypes.array,
  DatePicker2: PropTypes.array,
  DatePicker3: PropTypes.array,
  search: PropTypes.array,
};

//Select mẫu

/* select={
   data: DanhMucKhoSelect ? DanhMucKhoSelect : [], //is required
placeholder: "Danh mục kho",
optionsvalue: ["id", "tenKho"],
style: { width: "100%" },
showSearch: true,
optionFilterProp: "name",
onSelect: handleOnSelectKho,
disabled: disableDanhMucKho,
value: DanhMucKho,
onChange: (value) => setDanhMucKho(value),
allowClear: true,
onClear: handleClearKho,} */

//Search mẫu
// search = {
//     loading,
//     value: keyword,
//     onChange: onChangeKeyword,
//     onPressEnter: onSearchNguoiDung,
//     onSearch: onSearchNguoiDung,
//     allowClear: true,
//     placeholder: "Tìm kiếm",
// }

// RangePicker
// RangePicker={
//   format: "DD/MM/YYYY"
//   onChange: (date, dateString) => handleChangeNgay(dateString)
//   defaultValue: [
//       moment(FromDate, "DD/MM/YYYY"),
//       moment(ToDate, "DD/MM/YYYY"),
//   ]
// }
ThreeColSearch.defaultProps = {
  className: ["", "", ""],
  title: ["Tiêu đề 1", "Tiêu đề 2"],
};

ThreeColSearch.displayName = "NoData";
