export interface ToolConfig {
  id: string;
  name: {
    zh: string;
    en: string;
  };
  path: string;
  icon: string;
  category: string;
}

export interface ToolsConfig {
  tools: ToolConfig[];
  categories: {
    id: string;
    name: {
      zh: string;
      en: string;
    };
    icon: string;
  }[];
}

export const toolsConfig: ToolsConfig = {
  tools: [
    {
      id: 'base64-image',
      name: {
        zh: 'Base64 图片转换器',
        en: 'Base64 Image Converter'
      },
      path: '/tools/base64-image',
      icon: 'Image',
      category: 'base64',
    },
    {
      id: 'base64-pdf',
      name: {
        zh: 'Base64 PDF转换器',
        en: 'Base64 PDF Converter'
      },
      path: '/tools/base64-pdf',
      icon: 'FileText',
      category: 'base64',
    },
    {
      id: 'base64-text',
      name: {
        zh: 'Base64 文本转换器',
        en: 'Base64 Text Converter'
      },
      path: '/tools/base64-text',
      icon: 'Type',
      category: 'base64',
    },
    {
      id: 'base64-json',
      name: {
        zh: 'Base64 JSON转换器',
        en: 'Base64 JSON Converter'
      },
      path: '/tools/base64-json',
      icon: 'Braces',
      category: 'base64',
    },
    {
      id: 'base64-hex',
      name: {
        zh: 'Base64 Hex转换器',
        en: 'Base64 Hex Converter'
      },
      path: '/tools/base64-hex',
      icon: 'Hash',
      category: 'base64',
    },
    {
      id: 'base64-excel',
      name: {
        zh: 'Base64 Excel转换器',
        en: 'Base64 Excel Converter'
      },
      path: '/tools/base64-excel',
      icon: 'FileSpreadsheet',
      category: 'base64',
    },
    {
      id: 'base64-xml',
      name: {
        zh: 'Base64 XML转换器',
        en: 'Base64 XML Converter'
      },
      path: '/tools/base64-xml',
      icon: 'FileCode',
      category: 'base64',
    }
  ],
  categories: [
    {
      id: 'base64',
      name: {
        zh: 'Base64 工具',
        en: 'Base64 Tools'
      },
      icon: 'Code'
    }
  ]
};

// 工具配置工具函数
export const getToolById = (id: string): ToolConfig | undefined => {
  return toolsConfig.tools.find(tool => tool.id === id);
};

export const getToolsByCategory = (categoryId: string): ToolConfig[] => {
  return toolsConfig.tools.filter(tool => tool.category === categoryId);
};

export const getAllTools = (): ToolConfig[] => {
  return toolsConfig.tools;
};

export const getCategories = () => {
  return toolsConfig.categories;
}; 