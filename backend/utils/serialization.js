const safeJSONStringify = (obj) => {
  if (!obj) return '{}';
  try {
    return JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  } catch (error) {
    console.error('JSON Serialization error:', error);
    return JSON.stringify({error: 'Serialization failed'});
  }
};

// Ensure proper exports
module.exports = {
  safeJSONStringify
};
