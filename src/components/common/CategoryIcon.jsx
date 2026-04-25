// src/components/common/CategoryIcon.jsx
import React from 'react';
import * as MdIcons from 'react-icons/md';

const CategoryIcon = ({ iconName, size = 24, style = {} }) => {
  if (!iconName) return <MdIcons.MdFolder style={{ fontSize: size, ...style }} />;

  const IconComponent = MdIcons[iconName];

  if (!IconComponent) {
    return <MdIcons.MdFolder style={{ fontSize: size, ...style }} />;
  }

  return <IconComponent style={{ fontSize: size, ...style }} />;
};

export default CategoryIcon;
