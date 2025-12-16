import { Card, Input } from 'antd';
import type { FC } from 'react';
import { useAppStore } from '../store/useAppStore';
import { parseSchema } from '../utils/schemaParser';
import { useCallback, useRef, useEffect } from 'react';

const { TextArea } = Input;

const Sidebar: FC = () => {
  const schemaText = useAppStore((state) => state.schemaText);
  const setSchemaText = useAppStore((state) => state.setSchemaText);
  const currentSchemaId = useAppStore((state) => state.currentSchemaId);
  const updateSchema = useAppStore((state) => state.updateSchema);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSchemaChange = useCallback(
    (newText: string) => {
      // Update text immediately for responsive typing
      setSchemaText(newText);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the parsing and visualization update
      debounceTimerRef.current = setTimeout(() => {
        if (currentSchemaId && newText.trim()) {
          try {
            const { tables, relations } = parseSchema(newText);

            // Only update if parsing was successful and produced valid results with at least one table
            if (tables.length > 0) {
              updateSchema(currentSchemaId, newText);
            }
          } catch (error) {
            // Invalid schema - don't update visualization, user is still typing
            console.debug('Schema parsing in progress:', error);
          }
        }
        if (newText.trim() === '' && currentSchemaId) {
          updateSchema(currentSchemaId, newText.trim());
        }
      }, 500); // Wait 500ms after user stops typing
    },
    [setSchemaText, currentSchemaId, updateSchema],
  );

  return (
    <Card
      style={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <TextArea
        value={schemaText}
        onChange={(e) => handleSchemaChange(e.target.value)}
        placeholder="Enter SQL CREATE TABLE statements..."
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          marginTop: 8,
          height: 'calc(100vh - 140px)',
        }}
      />
    </Card>
  );
};

export default Sidebar;
