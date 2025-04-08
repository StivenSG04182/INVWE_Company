"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Send, Paperclip, Plus, Search, Users, X } from "lucide-react";

interface Employee {
    id: string;
    name: string;
    avatar_url?: string;
    online?: boolean;
    last_seen?: string;
}

interface Group {
    id: string;
    name: string;
    members: string[];
    created_at: string;
}

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    type: "text" | "file" | "audio";
    file_url?: string;
    sender_name?: string;
    sender_avatar?: string;
}

const ChatPage = () => {
    const params = useParams();
    const companyName = params.companyName as string;

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [chatType, setChatType] = useState<"direct" | "group">("direct");
    const [isRecording, setIsRecording] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simular datos de empleados asociados al inventario
    useEffect(() => {
        // En un caso real, esto vendría de Supabase filtrando por companyId
        const fetchEmployees = async () => {
            try {
                // Aquí se haría una consulta real a Supabase
                // const { data, error } = await supabase
                //   .from('users_companies')
                //   .select('user_id, users(id, name, avatar_url, last_seen)')
                //   .eq('company_id', companyId);

                // Por ahora usamos datos de ejemplo
                const mockEmployees: Employee[] = [
                    { id: "1", name: "Ana Martínez", avatar_url: "/dev1.png", online: true },
                    { id: "2", name: "Carlos López", avatar_url: "/dev2.png", online: false, last_seen: "2023-06-15T14:30:00" },
                    { id: "3", name: "María Rodríguez", avatar_url: "/dev3.png", online: true },
                    { id: "4", name: "Juan Pérez", online: false, last_seen: "2023-06-15T10:15:00" },
                    { id: "5", name: "Laura Gómez", online: true },
                ];

                setEmployees(mockEmployees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
    }, []);

    // Simular datos de grupos
    useEffect(() => {
        const mockGroups: Group[] = [
            { id: "g1", name: "Equipo de Inventario", members: ["1", "2", "3"], created_at: "2023-05-10T09:00:00" },
            { id: "g2", name: "Logística", members: ["2", "4", "5"], created_at: "2023-05-15T14:30:00" },
        ];

        setGroups(mockGroups);
    }, []);

    // Configurar suscripción a mensajes en tiempo real con Supabase
    useEffect(() => {
        if (!selectedChat) return;

        // En un caso real, esto sería una suscripción a Supabase Realtime
        // const channel = supabase
        //   .channel(`chat:${chatType}:${selectedChat}`)
        //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
        //   .subscribe();

        // Cargar mensajes históricos
        const fetchMessages = async () => {
            try {
                // En un caso real, esto sería una consulta a Supabase
                // const { data, error } = await supabase
                //   .from('messages')
                //   .select('*')
                //   .eq(chatType === 'direct' ? 'conversation_id' : 'group_id', selectedChat)
                //   .order('created_at', { ascending: true });

                // Por ahora usamos datos de ejemplo
                const mockMessages: Message[] = chatType === "direct" ? [
                    { id: "m1", sender_id: "1", content: "Hola, ¿cómo va el inventario hoy?", created_at: "2023-06-15T09:30:00", type: "text", sender_name: "Ana Martínez", sender_avatar: "/dev1.png" },
                    { id: "m2", sender_id: "2", content: "Todo en orden, acabamos de recibir el nuevo lote", created_at: "2023-06-15T09:32:00", type: "text", sender_name: "Carlos López", sender_avatar: "/dev2.png" },
                    { id: "m3", sender_id: "1", content: "Perfecto, ¿podrías enviarme el informe?", created_at: "2023-06-15T09:33:00", type: "text", sender_name: "Ana Martínez", sender_avatar: "/dev1.png" },
                ] : [
                    { id: "m4", sender_id: "1", content: "Bienvenidos al grupo de Logística", created_at: "2023-05-15T14:35:00", type: "text", sender_name: "Ana Martínez", sender_avatar: "/dev1.png" },
                    { id: "m5", sender_id: "4", content: "Gracias por incluirme", created_at: "2023-05-15T14:40:00", type: "text", sender_name: "Juan Pérez" },
                    { id: "m6", sender_id: "5", content: "Hola a todos", created_at: "2023-05-15T14:45:00", type: "text", sender_name: "Laura Gómez" },
                ];

                setMessages(mockMessages);
                scrollToBottom();
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // return () => {
        //   supabase.removeChannel(channel);
        // };
    }, [selectedChat, chatType]);

    // Scroll al final de los mensajes cuando se reciben nuevos
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            // En un caso real, esto sería una inserción en Supabase
            // const { data, error } = await supabase.from('messages').insert({
            //   content: newMessage,
            //   sender_id: 'current-user-id',
            //   [chatType === 'direct' ? 'conversation_id' : 'group_id']: selectedChat,
            //   type: 'text',
            //   created_at: new Date().toISOString()
            // });

            // Simulamos la inserción local
            const newMsg: Message = {
                id: `m${Date.now()}`,
                sender_id: "1", // Simulamos que somos Ana Martínez
                content: newMessage,
                created_at: new Date().toISOString(),
                type: "text",
                sender_name: "Ana Martínez",
                sender_avatar: "/dev1.png"
            };

            setMessages([...messages, newMsg]);
            setNewMessage("");
            scrollToBottom();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChat) return;

        try {
            // En un caso real, esto subiría el archivo a Supabase Storage
            // const { data, error } = await supabase.storage
            //   .from('chat-files')
            //   .upload(`${Date.now()}_${file.name}`, file);

            // if (error) throw error;

            // const fileUrl = supabase.storage.from('chat-files').getPublicUrl(data.path).data.publicUrl;

            // Luego enviaríamos un mensaje con el enlace al archivo
            // await supabase.from('messages').insert({
            //   content: file.name,
            //   sender_id: 'current-user-id',
            //   [chatType === 'direct' ? 'conversation_id' : 'group_id']: selectedChat,
            //   type: 'file',
            //   file_url: fileUrl,
            //   created_at: new Date().toISOString()
            // });

            // Simulamos la inserción local
            const newMsg: Message = {
                id: `m${Date.now()}`,
                sender_id: "1", // Simulamos que somos Ana Martínez
                content: file.name,
                created_at: new Date().toISOString(),
                type: "file",
                file_url: URL.createObjectURL(file),
                sender_name: "Ana Martínez",
                sender_avatar: "/dev1.png"
            };

            setMessages([...messages, newMsg]);
            scrollToBottom();
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleRecordAudio = () => {
        // Aquí iría la lógica para grabar audio
        setIsRecording(!isRecording);

        if (isRecording) {
            // Simulamos el envío de un mensaje de audio
            const newMsg: Message = {
                id: `m${Date.now()}`,
                sender_id: "1", // Simulamos que somos Ana Martínez
                content: "Nota de voz",
                created_at: new Date().toISOString(),
                type: "audio",
                file_url: "/audio-example.mp3", // En un caso real, esto sería la URL del audio grabado
                sender_name: "Ana Martínez",
                sender_avatar: "/dev1.png"
            };

            setMessages([...messages, newMsg]);
            scrollToBottom();
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length === 0) return;

        try {
            // En un caso real, esto crearía un grupo en Supabase
            // const { data, error } = await supabase.from('groups').insert({
            //   name: newGroupName,
            //   created_by: 'current-user-id',
            //   created_at: new Date().toISOString()
            // }).select('id').single();

            // if (error) throw error;

            // Luego añadiríamos los miembros al grupo
            // const memberInserts = selectedMembers.map(memberId => ({
            //   group_id: data.id,
            //   user_id: memberId
            // }));

            // await supabase.from('group_members').insert(memberInserts);

            // Simulamos la creación local
            const newGroup: Group = {
                id: `g${Date.now()}`,
                name: newGroupName,
                members: [...selectedMembers, "1"], // Incluimos al usuario actual
                created_at: new Date().toISOString()
            };

            setGroups([...groups, newGroup]);
            setShowCreateGroup(false);
            setNewGroupName("");
            setSelectedMembers([]);
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
                <Tabs defaultValue="employees" className="w-full h-full flex flex-col">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="employees">Empleados</TabsTrigger>
                        <TabsTrigger value="groups">Grupos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="employees" className="flex-1 overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar empleados..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedChat === employee.id && chatType === "direct" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                                    onClick={() => {
                                        setSelectedChat(employee.id);
                                        setChatType("direct");
                                    }}
                                >
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarImage src={employee.avatar_url} />
                                            <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {employee.online && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{employee.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {employee.online ? "En línea" : `Última vez: ${new Date(employee.last_seen || "").toLocaleString()}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="groups" className="flex-1 overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-medium">Grupos</h3>
                            <Button size="sm" variant="ghost" onClick={() => setShowCreateGroup(true)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedChat === group.id && chatType === "group" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                                    onClick={() => {
                                        setSelectedChat(group.id);
                                        setChatType("group");
                                    }}
                                >
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarFallback className="bg-blue-500 text-white">
                                                <Users className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{group.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {group.members.length} miembros
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {chatType === "direct" ? (
                                    <>
                                        <Avatar>
                                            <AvatarImage src={employees.find(e => e.id === selectedChat)?.avatar_url} />
                                            <AvatarFallback>
                                                {employees.find(e => e.id === selectedChat)?.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-medium">{employees.find(e => e.id === selectedChat)?.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {employees.find(e => e.id === selectedChat)?.online ? "En línea" : "Desconectado"}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Avatar>
                                            <AvatarFallback className="bg-blue-500 text-white">
                                                <Users className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-medium">{groups.find(g => g.id === selectedChat)?.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {groups.find(g => g.id === selectedChat)?.members.length} miembros
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.sender_id === "1" ? "justify-end" : ""}`}>
                                    <div className={`flex gap-3 max-w-[70%] ${message.sender_id === "1" ? "flex-row-reverse" : ""}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={message.sender_avatar} />
                                            <AvatarFallback>{message.sender_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm font-medium ${message.sender_id === "1" ? "text-right" : ""}`}>
                                                    {message.sender_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>

                                            {message.type === "text" && (
                                                <div className={`p-3 rounded-lg ${message.sender_id === "1" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
                                                    {message.content}
                                                </div>
                                            )}

                                            {message.type === "file" && (
                                                <div className={`p-3 rounded-lg ${message.sender_id === "1" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
                                                    <div className="flex items-center gap-2">
                                                        <Paperclip className="h-4 w-4" />
                                                        <a
                                                            href={message.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline"
                                                        >
                                                            {message.content}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {message.type === "audio" && (
                                                <div className={`p-3 rounded-lg ${message.sender_id === "1" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
                                                    <div className="flex items-center gap-2">
                                                        <Mic className="h-4 w-4" />
                                                        <span>{message.content}</span>
                                                    </div>
                                                    {message.file_url && (
                                                        <audio controls className="mt-2 max-w-full">
                                                            <source src={message.file_url} type="audio/mpeg" />
                                                            Tu navegador no soporta el elemento de audio.
                                                        </audio>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="h-4 w-4" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </Button>

                                <Button
                                    size="icon"
                                    variant={isRecording ? "destructive" : "outline"}
                                    onClick={handleRecordAudio}
                                >
                                    {isRecording ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>

                                <Textarea
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />

                                <Button onClick={handleSendMessage}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">Selecciona un chat para comenzar</h3>
                            <p className="text-muted-foreground">Elige un empleado o grupo de la lista</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Crear nuevo grupo</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="groupName" className="block text-sm font-medium mb-1">
                                    Nombre del grupo
                                </label>
                                <Input
                                    id="groupName"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Ingresa un nombre para el grupo"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Seleccionar miembros
                                </label>
                                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                                    {employees.map((employee) => (
                                        <div key={employee.id} className="flex items-center py-1">
                                            <input
                                                type="checkbox"
                                                id={`employee-${employee.id}`}
                                                checked={selectedMembers.includes(employee.id)}
                                                onChange={() => {
                                                    if (selectedMembers.includes(employee.id)) {
                                                        setSelectedMembers(selectedMembers.filter(id => id !== employee.id));
                                                    } else {
                                                        setSelectedMembers([...selectedMembers, employee.id]);
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`employee-${employee.id}`} className="flex items-center cursor-pointer">
                                                <Avatar className="h-6 w-6 mr-2">
                                                    <AvatarImage src={employee.avatar_url} />
                                                    <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span>{employee.name}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreateGroup}>
                                Crear grupo
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;